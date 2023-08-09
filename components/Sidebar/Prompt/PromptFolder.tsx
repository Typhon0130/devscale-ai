import { KeyValuePair, Prompt, PromptFolder } from '@/types';
import {
  IconCaretDown,
  IconCaretRight,
  IconCheck,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import React, { FC, KeyboardEvent, useEffect, useState } from 'react';
import PromptComponent from '@/components/Prompt/Prompt';

interface Props {
  loading: boolean;
  prompts: Prompt[];
  selectedPrompt: Prompt;
  currentFolder: PromptFolder;
  searchTerm: string;
  onDeleteFolder: (folderId: number) => void;
  onUpdateFolder: (folderId: number, name: string) => void;
  onSelectPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  onUpdatePrompt: (prompt: Prompt, data: KeyValuePair[]) => void;
}

const PromptFolderComponent: FC<Props> = ({
  loading,
  prompts,
  selectedPrompt,
  searchTerm,
  onDeleteFolder,
  onUpdateFolder,
  onSelectPrompt,
  onDeletePrompt,
  onUpdatePrompt,
  currentFolder,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    }
  };

  const handleRename = () => {
    onUpdateFolder(currentFolder.id, renameValue);
    setRenameValue('');
    setIsRenaming(false);
  };

  const handleDrop = (e: any, folder: PromptFolder) => {
    if (e.dataTransfer) {
      setIsOpen(true);

      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));
      onUpdatePrompt(prompt, [{ key: 'folderId', value: folder.id }]);

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
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);
  return (
    <div>
      <div
        className={`mb-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[12px] leading-normal transition-colors duration-200 hover:bg-[#343541]/90`}
        onClick={() => setIsOpen(!isOpen)}
        onDrop={(e) => handleDrop(e, currentFolder)}
        onDragOver={allowDrop}
        onDragEnter={highlightDrop}
        onDragLeave={removeHighlight}
      >
        {isOpen ? <IconCaretDown size={16} /> : <IconCaretRight size={16} />}

        {isRenaming ? (
          <input
            className="flex-1 overflow-hidden overflow-ellipsis border-b border-neutral-400 bg-transparent pr-1 text-left text-white outline-none focus:border-neutral-100"
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        ) : (
          <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap pr-1 text-left">
            {currentFolder.name}
          </div>
        )}

        {(isDeleting || isRenaming) && (
          <div className="-ml-2 flex gap-1">
            <IconCheck
              className="min-w-[20px] text-neutral-400 hover:text-neutral-100"
              size={16}
              onClick={(e) => {
                e.stopPropagation();

                if (isDeleting) {
                  onDeleteFolder(currentFolder.id);
                } else if (isRenaming) {
                  handleRename();
                }

                setIsDeleting(false);
                setIsRenaming(false);
              }}
            />

            <IconX
              className="min-w-[20px] text-neutral-400 hover:text-neutral-100"
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            />
          </div>
        )}

        {!isDeleting && !isRenaming && (
          <div className="ml-2 flex gap-1">
            <IconPencil
              className="min-w-[20px] text-neutral-400 hover:text-neutral-100"
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setRenameValue(currentFolder.name);
              }}
            />

            <IconTrash
              className=" min-w-[20px] text-neutral-400 hover:text-neutral-100"
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(true);
              }}
            />
          </div>
        )}
      </div>

      {isOpen
        ? prompts.map((prompt, index) => {
            if (prompt.folderId === currentFolder.id) {
              return (
                <div key={index} className="ml-5 gap-2 border-l pl-2 pt-2">
                  <PromptComponent
                    selectedPrompt={selectedPrompt}
                    prompt={prompt}
                    loading={loading}
                    onSelectPrompt={onSelectPrompt}
                    onDeletePrompt={onDeletePrompt}
                    onUpdatePrompt={onUpdatePrompt}
                  />
                </div>
              );
            }
          })
        : null}
    </div>
  );
};

export default PromptFolderComponent;
