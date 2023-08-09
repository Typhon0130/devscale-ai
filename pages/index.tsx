import { Chat } from '@/components/Chat/Chat';
import { Navbar } from '@/components/Mobile/Navbar';
import { Sidebar } from '@/components/Sidebar/Conversation/Sidebar';
import {
  ChatBody,
  ChatFolder,
  Conversation,
  ErrorMessage,
  KeyValuePair,
  Message,
  OpenAIModel,
  OpenAIModelID,
  OpenAIModels,
  Prompt,
  PromptFolder,
} from '@/types';
import {
  cleanConversationHistory,
  cleanPromptHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { savePrompt, savePrompts, updatePrompt } from '@/utils/app/prompt';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import PromptSidebar from '@/components/Sidebar/Prompt/PromptSidebar';
import { savePromptFolders } from '@/utils/app/promptfolders';

interface HomeProps {
  serverSideApiKeyIsSet: boolean;
}

const Home: React.FC<HomeProps> = ({ serverSideApiKeyIsSet }) => {
  const { t } = useTranslation('chat');
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [promptFolders, setPromptFolders] = useState<PromptFolder[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const [loading, setLoading] = useState<boolean>(false);
  const [models, setModels] = useState<OpenAIModel[]>([]);
  const [lightMode, setLightMode] = useState<'dark' | 'light'>('dark');
  const [messageIsStreaming, setMessageIsStreaming] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showPromptSidebar, setShowPromptSidebar] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [messageError, setMessageError] = useState<boolean>(false);
  const [modelError, setModelError] = useState<ErrorMessage | null>(null);
  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Prompst Stat Variable
  const [promptloading, setPromptloading] = useState<boolean>(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>({
    id: 0,
    name: '',
    promptValue: [],
    folderId: 0,
    content: '',
    description: '',
  });

  const stopConversationRef = useRef<boolean>(false);

  const handleSend = async (message: Message, deleteCount = 0) => {
    if (selectedConversation) {
      let updatedConversation: Conversation;

      if (deleteCount) {
        const updatedMessages = [...selectedConversation.messages];
        for (let i = 0; i < deleteCount; i++) {
          updatedMessages.pop();
        }

        updatedConversation = {
          ...selectedConversation,
          messages: [...updatedMessages, message],
        };
      } else {
        updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, message],
        };
      }

      setSelectedConversation(updatedConversation);
      setLoading(true);
      setMessageIsStreaming(true);
      setMessageError(false);

      if (updatedConversation.index.indexName.length === 0) {
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: updatedConversation.messages,
          key: apiKey,
          prompt: updatedConversation.prompt,
        };

        const controller = new AbortController();
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify(chatBody),
        });

        if (!response.ok) {
          setLoading(false);
          setMessageIsStreaming(false);
          setMessageError(true);
          return;
        }

        const data = response.body;

        if (!data) {
          setLoading(false);
          setMessageIsStreaming(false);
          setMessageError(true);

          return;
        }

        if (updatedConversation.messages.length === 1) {
          const { content } = message;
          const customName =
            content.length > 30 ? content.substring(0, 30) + '...' : content;

          updatedConversation = {
            ...updatedConversation,
            name: customName,
          };
        }

        setLoading(false);

        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let isFirst = true;
        let text = '';

        while (!done) {
          if (stopConversationRef.current === true) {
            controller.abort();
            done = true;
            break;
          }
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);

          text += chunkValue;

          if (isFirst) {
            isFirst = false;
            const updatedMessages: Message[] = [
              ...updatedConversation.messages,
              { role: 'assistant', content: chunkValue },
            ];

            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };

            setSelectedConversation(updatedConversation);
          } else {
            const updatedMessages: Message[] = updatedConversation.messages.map(
              (message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...message,
                    content: text,
                  };
                }

                return message;
              },
            );

            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };

            setSelectedConversation(updatedConversation);
          }
        }
      } else {
        // send to chat file server
        const response = await fetch(
          `/api/query?message=${message.content}&indexName=${updatedConversation.index.indexName}&indexType=${updatedConversation.index.indexType}`,
          {
            method: 'GET',
          },
        );

        const answer = (await response.json()) as string;

        const updatedMessages: Message[] = [
          ...updatedConversation.messages,
          { role: 'assistant', content: answer },
        ];

        updatedConversation = {
          ...updatedConversation,
          messages: updatedMessages,
        };

        setLoading(false);

        setSelectedConversation(updatedConversation);
      }

      saveConversation(updatedConversation);

      const updatedConversations: Conversation[] = conversations.map(
        (conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation;
          }

          return conversation;
        },
      );

      if (updatedConversations.length === 0) {
        updatedConversations.push(updatedConversation);
      }

      setConversations(updatedConversations);

      saveConversations(updatedConversations);

      setMessageIsStreaming(false);
    }
  };

  const fetchModels = async (key: string) => {
    const error = {
      title: t('Error fetching models.'),
      code: null,
      messageLines: [
        t(
          'Make sure your OpenAI API key is set in the bottom left of the sidebar.',
        ),
        t('If you completed this step, OpenAI may be experiencing issues.'),
      ],
    } as ErrorMessage;

    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
      }),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        Object.assign(error, {
          code: data.error?.code,
          messageLines: [data.error?.message],
        });
      } catch (e) {}
      setModelError(error);
      return;
    }

    const data = await response.json();

    if (!data) {
      setModelError(error);
      return;
    }

    setModels(data);
    setModelError(null);
  };

  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode);
    localStorage.setItem('theme', mode);
  };

  const handleApiKeyChange = (apiKey: string) => {
    setApiKey(apiKey);
    localStorage.setItem('apiKey', apiKey);
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: {
    conversations: Conversation[];
    folders: ChatFolder[];
  }) => {
    importData(data.conversations, data.folders);
    setConversations(data.conversations);
    setSelectedConversation(data.conversations[data.conversations.length - 1]);
    setFolders(data.folders);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    saveConversation(conversation);
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    savePrompt(prompt);
  };

  const handleCreateFolder = (name: string) => {
    const lastFolder = folders[folders.length - 1];

    const newFolder: ChatFolder = {
      id: lastFolder ? lastFolder.id + 1 : 1,
      name,
    };

    const updatedFolders = [...folders, newFolder];

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
    console.log(folders, 'folders');
  };

  const handleCreatePromptFolder = (name: string) => {
    const lastFolder = promptFolders[promptFolders.length - 1];

    const newFolder: PromptFolder = {
      id: lastFolder ? lastFolder.id + 1 : 1,
      name,
    };

    const updatedFolders = [...promptFolders, newFolder];

    setPromptFolders(updatedFolders);
    savePromptFolders(updatedFolders);
    console.log(promptFolders, 'promptFolders');
  };

  const handleDeleteFolder = (folderId: number) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: 0,
        };
      }

      return c;
    });
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  const handleDeletePromptFolder = (folderId: number) => {
    const updatedFolders = promptFolders.filter((f) => f.id !== folderId);
    setPromptFolders(updatedFolders);
    savePromptFolders(updatedFolders);
  };

  const handleUpdateFolder = (folderId: number, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const handleUpdatePromptFolder = (folderId: number, name: string) => {
    console.log(folderId, name);
    const updatedPromptFolders = promptFolders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    console.log(updatedPromptFolders, 'updatedPromptFolders');

    setPromptFolders(updatedPromptFolders);
    savePromptFolders(updatedPromptFolders);
  };

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: lastConversation ? lastConversation.id + 1 : 1,
      name: `${t('Conversation')} ${
        lastConversation ? lastConversation.id + 1 : 1
      }`,
      messages: [],
      model: OpenAIModels[OpenAIModelID.GPT_3_5],
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: 0,
      index: {
        indexName: '',
        indexType: '',
      },
    };

    const updatedConversations = [...conversations, newConversation];

    setSelectedConversation(newConversation);
    setConversations(updatedConversations);

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    setLoading(false);
  };

  const handleNewPrompt = () => {
    const lastPrompt = prompts[prompts.length - 1];

    const newPrompt: Prompt = {
      id: lastPrompt ? lastPrompt.id + 1 : 1,
      name: `${t('Prompt')} ${lastPrompt ? lastPrompt.id + 1 : 1}`,
      folderId: 0,
      promptValue: [],
      content: '',
      description: '',
    };

    const updatedPrompts = [...prompts, newPrompt];

    setSelectedPrompt(newPrompt);
    setPrompts(updatedPrompts);

    savePrompt(newPrompt);
    savePrompts(updatedPrompts);

    setLoading(false);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      setSelectedConversation(
        updatedConversations[updatedConversations.length - 1],
      );
      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      setSelectedConversation({
        id: 1,
        name: 'New conversation',
        messages: [],
        model: OpenAIModels[OpenAIModelID.GPT_3_5],
        prompt: DEFAULT_SYSTEM_PROMPT,
        folderId: 0,
        index: {
          indexName: '',
          indexType: '',
        },
      });
      localStorage.removeItem('selectedConversation');
    }
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);
    setPrompts(updatedPrompts);
    savePrompts(updatedPrompts);

    if (updatedPrompts.length > 0) {
      setSelectedPrompt(updatedPrompts[updatedPrompts.length - 1]);
      savePrompt(updatedPrompts[updatedPrompts.length - 1]);
    } else {
      setSelectedPrompt({
        id: 1,
        name: 'New Prompt',
        folderId: 0,
        promptValue: [],
        content: '',
        description: '',
      });
      localStorage.removeItem('selectedPrompt');
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    setSelectedConversation(single);
    setConversations(all);
  };

  const handleUpdatePrompt = (prompt: Prompt) => {
    const updatedPrompt = {
      ...prompt,
    };

    const { single, all } = updatePrompt(updatedPrompt, prompts);

    setSelectedPrompt(single);
    setPrompts(all);
  };

  const handleClearConversations = () => {
    setConversations([]);
    localStorage.removeItem('conversationHistory');

    setSelectedConversation({
      id: 1,
      name: 'New conversation',
      messages: [],
      model: OpenAIModels[OpenAIModelID.GPT_3_5],
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: 0,
      index: {
        indexName: '',
        indexType: '',
      },
    });
    localStorage.removeItem('selectedConversation');

    setFolders([]);
    localStorage.removeItem('folders');
  };

  const handleClearPrompts = () => {
    setPrompts([]);
    localStorage.removeItem('promptHistory');

    setSelectedPrompt({
      id: 1,
      name: 'New Prompt',
      promptValue: [],
      folderId: 0,
      content: '',
      description: '',
    });
    localStorage.removeItem('selectedPrompt');

    setFolders([]);
    localStorage.removeItem('promptFolders');
  };

  const handleEditMessage = (message: Message, messageIndex: number) => {
    if (selectedConversation) {
      const updatedMessages = selectedConversation.messages
        .map((m, i) => {
          if (i < messageIndex) {
            return m;
          }
        })
        .filter((m) => m) as Message[];

      const updatedConversation = {
        ...selectedConversation,
        messages: updatedMessages,
      };

      const { single, all } = updateConversation(
        updatedConversation,
        conversations,
      );

      setSelectedConversation(single);
      setConversations(all);

      setCurrentMessage(message);
    }
  };

  useEffect(() => {
    if (currentMessage) {
      handleSend(currentMessage);
      setCurrentMessage(undefined);
    }
  }, [currentMessage]);

  useEffect(() => {
    if (window.innerWidth < 640) {
      setShowSidebar(false);
      setShowPromptSidebar(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (apiKey) {
      fetchModels(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      setLightMode(theme as 'dark' | 'light');
    }

    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      setApiKey(apiKey);
      fetchModels(apiKey);
    } else if (serverSideApiKeyIsSet) {
      fetchModels('');
    }

    if (window.innerWidth < 640) {
      setShowSidebar(false);
      setShowPromptSidebar(false);
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      setFolders(JSON.parse(folders));
    }

    const promptFolders = localStorage.getItem('promptfolders');

    if (promptFolders) {
      setPromptFolders(JSON.parse(promptFolders));
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );
      setConversations(cleanedConversationHistory);
    }

    const promptHistory = localStorage.getItem('promptHistory');
    if (promptHistory) {
      const parsedPromptHistory: Prompt[] = JSON.parse(promptHistory);
      const cleanedPromptHistory = cleanPromptHistory(parsedPromptHistory);
      setPrompts(cleanedPromptHistory);
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );
      setSelectedConversation(cleanedSelectedConversation);
    } else {
      setSelectedConversation({
        id: 1,
        name: 'New conversation',
        messages: [],
        model: OpenAIModels[OpenAIModelID.GPT_3_5],
        prompt: DEFAULT_SYSTEM_PROMPT,
        folderId: 0,
        index: {
          indexName: '',
          indexType: '',
        },
      });
    }
  }, [serverSideApiKeyIsSet]);

  return (
    <>
      <Head>
        <title>Pacifica AI x Devscale</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full lg:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] lg:pt-0">
            {showSidebar ? (
              <div>
                <Sidebar
                  loading={messageIsStreaming}
                  conversations={conversations}
                  lightMode={lightMode}
                  selectedConversation={selectedConversation}
                  apiKey={apiKey}
                  folders={folders}
                  onToggleLightMode={handleLightMode}
                  onCreateFolder={handleCreateFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onUpdateFolder={handleUpdateFolder}
                  onNewConversation={handleNewConversation}
                  onSelectConversation={handleSelectConversation}
                  onDeleteConversation={handleDeleteConversation}
                  onToggleSidebar={() => setShowSidebar(!showSidebar)}
                  onUpdateConversation={handleUpdateConversation}
                  onApiKeyChange={handleApiKeyChange}
                  onClearConversations={handleClearConversations}
                  onExportConversations={handleExportData}
                  onImportConversations={handleImportConversations}
                />

                <div
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 lg:hidden"
                ></div>
              </div>
            ) : (
              <IconArrowBarRight
                className="fixed top-2.5 left-4 z-50 h-7 w-7 cursor-pointer text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:h-8 sm:w-8 sm:text-neutral-700 lg:left-4"
                onClick={() => setShowSidebar(!showSidebar)}
              />
            )}

            <Chat
              conversation={selectedConversation}
              messageIsStreaming={messageIsStreaming}
              apiKey={apiKey}
              serverSideApiKeyIsSet={serverSideApiKeyIsSet}
              modelError={modelError}
              messageError={messageError}
              models={models}
              loading={loading}
              onSend={handleSend}
              onUpdateConversation={handleUpdateConversation}
              onEditMessage={handleEditMessage}
              stopConversationRef={stopConversationRef}
              // speaking={speaking}
              // setSpeaking={setSpeaking}
            />
            {showPromptSidebar ? (
              <div>
                <PromptSidebar
                  loading={promptloading}
                  prompts={prompts}
                  selectedPrompt={selectedPrompt}
                  promptfolders={promptFolders}
                  onCreateFolder={handleCreatePromptFolder}
                  onDeleteFolder={handleDeletePromptFolder}
                  onUpdateFolder={handleUpdatePromptFolder}
                  onNewPrompt={handleNewPrompt}
                  onSelectPrompt={handleSelectPrompt}
                  onDeletePrompt={handleDeletePrompt}
                  onToggleSidebar={() => setShowPromptSidebar(!showSidebar)}
                  onUpdatePrompt={handleUpdatePrompt}
                  onClearPrompts={handleClearPrompts}
                />

                <div
                  onClick={() => setShowPromptSidebar(!showPromptSidebar)}
                  className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 lg:hidden"
                ></div>
              </div>
            ) : (
              <IconArrowBarLeft
                className="fixed top-2.5 right-4 z-50 h-7 w-7 cursor-pointer text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-4 sm:h-8 sm:w-8 sm:text-neutral-700"
                onClick={() => setShowPromptSidebar(!showPromptSidebar)}
              />
            )}
          </div>
        </main>
      )}
    </>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
      ])),
    },
  };
};
