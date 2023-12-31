import { Conversation, OpenAIModelID, OpenAIModels, Prompt } from '@/types';
import { DEFAULT_SYSTEM_PROMPT } from './const';

export const cleanSelectedConversation = (conversation: Conversation) => {
  // added model for each conversation (3/20/23)
  // added system prompt for each conversation (3/21/23)
  // added folders (3/23/23)

  let updatedConversation = conversation;

  // check for model on each conversation
  if (!updatedConversation.model) {
    updatedConversation = {
      ...updatedConversation,
      model: updatedConversation.model || OpenAIModels[OpenAIModelID.GPT_3_5],
    };
  }

  // check for system prompt on each conversation
  if (!updatedConversation.prompt) {
    updatedConversation = {
      ...updatedConversation,
      prompt: updatedConversation.prompt || DEFAULT_SYSTEM_PROMPT,
    };
  }

  if (!updatedConversation.folderId) {
    updatedConversation = {
      ...updatedConversation,
      folderId: updatedConversation.folderId || 0,
    };
  }

  return updatedConversation;
};

export const cleanSelectedPrompt = (prompt: Prompt) => {
  let updatedPrompt = prompt;

  if (!updatedPrompt.folderId) {
    updatedPrompt = {
      ...updatedPrompt,
      folderId: updatedPrompt.folderId || 0,
    };
  }

  return updatedPrompt;
};

export const cleanConversationHistory = (history: Conversation[]) => {
  return history.reduce((acc: Conversation[], conversation) => {
    try {
      if (!conversation.model) {
        conversation.model = OpenAIModels[OpenAIModelID.GPT_3_5];
      }

      if (!conversation.prompt) {
        conversation.prompt = DEFAULT_SYSTEM_PROMPT;
      }

      if (!conversation.folderId) {
        conversation.folderId = 0;
      }

      acc.push(conversation);
      return acc;
    } catch (error) {
      console.warn(
        `error while cleaning conversations' history. Removing culprit`,
        error,
      );
    }
    return acc;
  }, []);
};

export const cleanPromptHistory = (history: Prompt[]) => {
  return history.reduce((acc: Prompt[], prompt) => {
    try {
      if (!prompt.folderId) {
        prompt.folderId = 0;
      }

      acc.push(prompt);
      return acc;
    } catch (error) {
      console.warn(
        `error while cleaning conversations' history. Removing culprit`,
        error,
      );
    }
    return acc;
  }, []);
};
