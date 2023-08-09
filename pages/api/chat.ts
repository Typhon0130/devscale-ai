import { ChatBody, Message, OpenAIModelID } from '@/types';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIStream } from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { init, Tiktoken } from '@dqbd/tiktoken/lite/init';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
} from 'langchain/schema';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import {
  RetrievalQAChain,
  LLMChain,
  ConversationalRetrievalQAChain,
} from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { ChatOpenAI } from 'langchain/chat_models';
import { makeChain } from '@/utils/makechain';
import { NextApiRequest, NextApiResponse } from 'next';
import { getChatModel } from '@/utils/server/opnai';

const hanlder = async (req: NextApiRequest, res: NextApiResponse) => {
  const { messages, prompt } = req.body as ChatBody;

  let input: string;

  if (messages.length === 1) {
    input = messages[0].content;
  } else {
    input = messages[messages.length - 1].content;
  }

  const historyMessages: BaseChatMessage[] = messages
    ?.slice(0, messages.length - 1)
    .map((message) => {
      if (message.role === 'user') {
        return new HumanChatMessage(message.content);
      } else if (message.role === 'assistant') {
        return new AIChatMessage(message.content);
      }
      throw new TypeError('Invalid message role');
    });

  try {
    const llm = await getChatModel(res);

    const promptTemplate = ChatPromptTemplate.fromPromptMessages([
      // SystemMessagePromptTemplate.fromTemplate(prompt ? prompt : DEFAULT_SYSTEM_PROMPT),
      // new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(historyMessages),
      memoryKey: 'chat_history',
      inputKey: 'question',
      returnMessages: true,
    });

    // Set Config PineCone Environment
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT as string,
      apiKey: process.env.PINECONE_API_KEY as string,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX ?? '');

    // Create VectorStore
    const dbConfig = {
      pineconeIndex: index,
      namespace: process.env.PINECONE_NAMESPACE ?? '',
      textKey: 'text',
    };
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      dbConfig,
    );
    res.writeHead(200, {
      'Content-Type': 'text/event-strea',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    // const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(), {
    //   inputKey: 'question',
    //   returnSourceDocuments: true,
    // });

    // const response = await chain.call({
    //   question: input,
    // });

    const chain = ConversationalRetrievalQAChain.fromLLM(
      llm,
      vectorStore.asRetriever(),
      {
        memory: new BufferMemory({
          memoryKey: 'chat_history', // Must be set to "chat_history"
          inputKey: 'question',
          returnMessages: true,
        }),
      },
    );

    const response = await chain.call({
      question: input,
      chat_history: new ChatMessageHistory(historyMessages),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: (err as Error).toString() });
  }
};

export default hanlder;
