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
import { makeChain } from '@/utils/makechain';
import { NextApiRequest, NextApiResponse } from 'next';

// export const config = {
//   runtime: 'edge',
// };

const PineconeData = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set Config PineCone Environment
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT as string,
    apiKey: process.env.PINECONE_API_KEY as string,
  });
  const { key, messages, model, prompt } = req.body as ChatBody;

  // OpenAI recommends replacing newlines with space for best results
  const sanitizedQuestion = messages[messages.length - 1].content
    .trim()
    .replaceAll('\n', ' ');

  console.log(sanitizedQuestion, 'sanitizedQuestion');

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

  // create chain
  const chain = makeChain(vectorStore);

  try {
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: messages || [],
    });

    console.log('respose', response);
  } catch (error) {
    console.log(error);
  } finally {
    res.end();
  }
};

// const handler = async (req: Request): Promise<Response> => {
//   try {
//     const { model, messages, key, prompt } = (await req.json()) as ChatBody;

//     await init((imports) => WebAssembly.instantiate(wasm, imports));
//     const encoding = new Tiktoken(
//       tiktokenModel.bpe_ranks,
//       tiktokenModel.special_tokens,
//       tiktokenModel.pat_str,
//     );

//     const tokenLimit = model.id === OpenAIModelID.GPT_4 ? 6000 : 3000;

//     let promptToSend = prompt;
//     if (!promptToSend) {
//       promptToSend = DEFAULT_SYSTEM_PROMPT;
//     }

//     const prompt_tokens = encoding.encode(promptToSend);

//     let tokenCount = prompt_tokens.length;
//     let messagesToSend: Message[] = [];

//     for (let i = messages.length - 1; i >= 0; i--) {
//       const message = messages[i];

//       const tokens = encoding.encode(message.content);

//       if (tokenCount + tokens.length > tokenLimit) {
//         break;
//       }
//       tokenCount += tokens.length;
//       messagesToSend = [message, ...messagesToSend];
//     }

//     encoding.free();

//     const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);

//     return new Response(stream);
//   } catch (error) {
//     console.error(error);
//     return new Response('Error', { status: 500 });
//   }
// };

export default PineconeData;
