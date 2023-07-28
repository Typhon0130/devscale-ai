import { Prompt } from '@/types';

export const updatePrompt = (updatedPrompt: Prompt, allPrompts: Prompt[]) => {
  const updatedConversations = allPrompts.map((p) => {
    if (p.id === updatedPrompt.id) {
      return updatedPrompt;
    }

    return p;
  });

  savePrompt(updatedPrompt);
  savePrompts(updatedConversations);

  return {
    single: updatedPrompt,
    all: updatedConversations,
  };
};

export const savePrompt = (prompt: Prompt) => {
  localStorage.setItem('selectedPrompt', JSON.stringify(prompt));
};

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem('promptHistory', JSON.stringify(prompts));
};
