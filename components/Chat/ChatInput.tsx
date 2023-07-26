import 'regenerator-runtime/runtime';
import { Message, OpenAIModel, OpenAIModelID } from '@/types';
import { IconPlayerStop, IconRepeat, IconSend } from '@tabler/icons-react';
import {
  FC,
  KeyboardEvent,
  MutableRefObject,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import addNotification from 'react-push-notification';

interface Props {
  messageIsStreaming: boolean;
  model: OpenAIModel;
  conversationIsEmpty: boolean;
  onSend: (message: Message) => void;
  onRegenerate: () => void;
  stopConversationRef: MutableRefObject<boolean>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: FC<Props> = ({
  messageIsStreaming,
  model,
  conversationIsEmpty,
  onSend,
  onRegenerate,
  stopConversationRef,
  textareaRef,
}) => {
  const { t } = useTranslation('chat');
  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [listen, setListen] = useState<boolean>(false);
  const [speechCatch, setSpeechCatch] = useState<string>('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    SpeechRecognition.startListening();
    console.log('Speech Available => ' + browserSupportsSpeechRecognition)
  }, []);

  useEffect(() => {
    if (!listening) {
      if (listen) {
        const text: string | undefined = content;
        if (text !== undefined) {
          setContent(text + speechCatch);
        } else {
          setContent(speechCatch);
        }
        setSpeechCatch('');
      }
      SpeechRecognition.startListening();
    }
  }, [listening]);
  
  useEffect(() => {
    handleVoiceCommand(transcript);
    if (listen) {
      setSpeechCatch(transcript);
    }
  }, [transcript]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxLength = model.id === OpenAIModelID.GPT_3_5 ? 12000 : 24000;

    if (value.length > maxLength) {
      return;
    }

    setContent(value);
  };

  const handleSend = () => {
    if (messageIsStreaming) {
      return;
    }

    if (!content) {
      // addNotification({
      //   title: "Warning!",
      //   subtitle: "Please enter a message",
      //   // message: `Total: ${result.length}`,
      //   theme: "red",
      //   duration: 5000,
      //   native: false,
      //   closeButton: "X",
      // })
      // alert(t('Please enter a message'));
      return;
    }

    onSend({ role: 'user', content });
    setContent('');

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isTyping) {
      if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  function handleVoiceCommand (command: string) {
    console.log(`command :=> ${command.toLowerCase()}`);
    const startCommandList: string[] = [
      'despot', 'missbot', 'baseball', 'misbot', 'missput', 'misssport', 'misssports', 'despot', 'misbah', 'missbut', 'mispot'
    ];
    if (startCommandList.filter((item: string) => 
      item.trim().replace(' ', '') === command).length > 0) {
      console.log(`start command`)
      setListen(true);
    }
    const sendCommandList: string[] = [
      'send', 'cend', 'cent', 'sen'
    ];
    if (sendCommandList.filter((item: string) => 
    item.trim().replace(' ', '') === command).length > 0) {
      console.log(`send command`);
      setListen(false);
      handleSend();
    }
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content]);

  function handleStopConversation() {
    stopConversationRef.current = true;
    setTimeout(() => {
      stopConversationRef.current = false;
    }, 1000);
  }

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#343541] dark:to-[#343541] md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl">
        {messageIsStreaming && (
          <button
            className="absolute -top-2 left-0 right-0 mx-auto w-fit rounded border border-neutral-200 bg-white py-2 px-4 text-black dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:top-0"
            onClick={handleStopConversation}
          >
            <IconPlayerStop size={16} className="mb-[2px] inline-block" />{' '}
            {t('Stop Generating')}
          </button>
        )}

        {!messageIsStreaming && !conversationIsEmpty && (
          <button
            className="absolute -top-2 left-0 right-0 mx-auto w-fit rounded border border-neutral-200 bg-white py-2 px-4 text-black dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:top-0"
            onClick={onRegenerate}
          >
            <IconRepeat size={16} className="mb-[2px] inline-block" />{' '}
            {t('Regenerate response')}
          </button>
        )}
        <div className="relative flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white py-2 shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] md:py-3 md:pl-4">  
          <textarea
            ref={textareaRef}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 text-black outline-none focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:text-white md:pl-0"
            style={{
              resize: 'none',
              paddingLeft: '15px',
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: '400px',
              overflow: `${
                textareaRef.current && textareaRef.current.scrollHeight > 400
                  ? 'auto'
                  : 'hidden'
              }`,
            }}
            placeholder={t('Type a message...') || ''}
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute right-3 rounded-sm p-1 text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900 focus:outline-none dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={handleSend}
          >
            <IconSend size={16} className="opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
};
