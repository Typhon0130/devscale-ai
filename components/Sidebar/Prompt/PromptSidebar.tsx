import React from 'react';
import {
  IconArrowBarLeft,
  IconFolderPlus,
  IconMessagesOff,
  IconPlus,
} from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Search } from '../../Search';
import { PromptFolder, Prompt, KeyValuePair } from '@/types';
import Prompts from '../../Prompt/Prompts';
import PromptFolders from './PromptFolders';

interface Props {
  loading: boolean;
  prompts: Prompt[];
  selectedPrompt: Prompt;
  promptfolders: PromptFolder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onUpdateFolder: (folderId: number, name: string) => void;
  onNewPrompt: () => void;
  onSelectPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  onToggleSidebar: () => void;
  onUpdatePrompt: (prompt: Prompt, data: KeyValuePair) => void;
  onClearPrompts: () => void;
}

const PromptSidebar: FC<Props> = ({
  loading,
  prompts,
  selectedPrompt,
  promptfolders,
  onCreateFolder,
  onDeleteFolder,
  onUpdateFolder,
  onNewPrompt,
  onSelectPrompt,
  onDeletePrompt,
  onToggleSidebar,
  onUpdatePrompt,
  onClearPrompts,
}) => {
  const { t } = useTranslation('sidebar');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(prompts);

  const handleUpdatePrompt = (prompt: Prompt, data: KeyValuePair) => {
    onUpdatePrompt(prompt, data);
    setSearchTerm('');
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    onDeletePrompt(prompt);
    setSearchTerm('');
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));
      onUpdatePrompt(prompt, { key: 'folderId', value: 0 });

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  useEffect(() => {
    if (searchTerm) {
      setFilteredPrompts(
        prompts.filter((prompt) => {
          const searchable =
            prompt.name.toLocaleLowerCase() +
            ' ' +
            prompt.promptValue.map((v) => v.value).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      );
    } else {
      setFilteredPrompts(prompts);
    }
  }, [searchTerm, prompts]);

  useEffect(() => {
    console.log(prompts, '```````````````');
  }, [prompts]);
  return (
    <aside
      className={`fixed top-0 bottom-0 right-0 z-50 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <header className="mt-5 flex items-center justify-center">
        <button
          className="flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center justify-center gap-3 rounded-md border border-white/20 bg-primary p-3 text-center text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-bgPrimary"
          onClick={() => {
            onNewPrompt();
            setSearchTerm('');
          }}
        >
          <IconPlus size={18} />
          {t('New Prompt')}
        </button>

        <button
          className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={() => onCreateFolder(t('New folder'))}
        >
          <IconFolderPlus size={18} />
        </button>

        <IconArrowBarLeft
          className="ml-1 block cursor-pointer p-1 text-neutral-300 hover:text-neutral-400 md:hidden"
          size={32}
          onClick={onToggleSidebar}
        />
      </header>
      {prompts.length > 1 && (
        <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
      )}

      <div className="flex-grow overflow-y-auto overflow-x-clip">
        {promptfolders.length > 0 && (
          <div className="flex border-b border-white/20 pb-2">
            <PromptFolders
              searchTerm={searchTerm}
              prompts={filteredPrompts.filter(
                (prompt) => prompt.folderId !== 0,
              )}
              folders={promptfolders}
              onDeleteFolder={onDeleteFolder}
              onUpdateFolder={onUpdateFolder}
              selectedPrompt={selectedPrompt}
              loading={loading}
              onSelectPrompt={onSelectPrompt}
              onDeletePrompt={handleDeletePrompt}
              onUpdatePrompt={handleUpdatePrompt}
            />
          </div>
        )}

        {prompts.length > 0 ? (
          <div
            className="h-full w-full pt-2"
            onDrop={(e) => handleDrop(e)}
            onDragOver={allowDrop}
            onDragEnter={highlightDrop}
            onDragLeave={removeHighlight}
          >
            <Prompts
              loading={loading}
              prompts={filteredPrompts.filter(
                (prompt) =>
                  prompt.folderId === 0 || !promptfolders[prompt.folderId - 1],
              )}
              selectedPrompt={selectedPrompt}
              onSelectPrompt={onSelectPrompt}
              onDeletePrompt={handleDeletePrompt}
              onUpdatePrompt={handleUpdatePrompt}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="mt-8 select-none text-center text-white opacity-50">
              <IconMessagesOff className="mx-auto mb-3" />
              <span className="text-[12.5px] leading-3">{t('No Data.')}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default PromptSidebar;
