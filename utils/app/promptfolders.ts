import { PromptFolder } from '@/types';

export const saveFolders = (promptfolders: PromptFolder[]) => {
  localStorage.setItem('promptfolders', JSON.stringify(promptfolders));
};
