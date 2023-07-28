import React, { FC } from 'react';
import PromptFolderComponent from './PromptFolder';
import { KeyValuePair, Prompt, PromptFolder } from '@/types';

interface Props {
  searchTerm: string;
  prompts: Prompt[];
  folders: PromptFolder[];
  onDeleteFolder: (folder: number) => void;
  onUpdateFolder: (folder: number, name: string) => void;
  selectedPrompt: Prompt;
  loading: boolean;
  onSelectPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  onUpdatePrompt: (prompt: Prompt, data: KeyValuePair) => void;
}

const PromptFolders: FC<Props> = ({
  searchTerm,
  prompts,
  folders,
  onDeleteFolder,
  onUpdateFolder,
  // conversation props
  selectedPrompt,
  loading,
  onSelectPrompt,
  onDeletePrompt,
  onUpdatePrompt,
}) => {
  return (
    <div className="flex w-full flex-col gap-1 pt-2">
      {folders.map((folder, index) => (
        <PromptFolderComponent
          key={index}
          searchTerm={searchTerm}
          prompts={prompts.filter((p) => p.folderId)}
          currentFolder={folder}
          onDeleteFolder={onDeleteFolder}
          onUpdateFolder={onUpdateFolder}
          // conversation props
          selectedPrompt={selectedPrompt}
          loading={loading}
          onSelectPrompt={onSelectPrompt}
          onDeletePrompt={onDeletePrompt}
          onUpdatePrompt={onUpdatePrompt}
        />
      ))}
    </div>
  );
};

export default PromptFolders;
