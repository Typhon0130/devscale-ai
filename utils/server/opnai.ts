import { OpenAIChat } from 'langchain/llms/openai';
import { CallbackManager } from 'langchain/callbacks';
import { NextApiResponse } from 'next';

// function that define Chat Model
export const getChatModel = async (res: NextApiResponse) => {
  return new OpenAIChat({
    temperature: 0.9,
    modelName: 'gpt-3.5-turbo',
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    callbacks: getCallbackManager(res),
  });
};

export const getCallbackManager = (res: NextApiResponse) => {
  return CallbackManager.fromHandlers({
    handleLLMNewToken: async (
      token: string,
      runId: string,
      parentRunId?: string,
    ) => {
      res.write(token);
    },
    handleLLMEnd: async () => {
      res.end();
    },
  });
};
