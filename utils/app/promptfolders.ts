import { PromptFolder } from '@/types';

export const savePromptFolders = (promptfolders: PromptFolder[]) => {
  localStorage.setItem('promptfolders', JSON.stringify(promptfolders));
};
