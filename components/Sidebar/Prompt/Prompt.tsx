import { KeyValuePair, Prompt } from '@/types';
import {
  IconCheck,
  IconPencil,
  IconTrash,
  IconX,
  IconPrompt,
} from '@tabler/icons-react';
import React, {
  DragEvent,
  FC,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react';

interface Props {
  loading: boolean;
  prompt: Prompt;
  selectedPrompt: Prompt;
  onSelectPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  onUpdatePrompt: (prompt: Prompt, data: KeyValuePair) => void;
}

const PromptComponent: FC<Props> = ({
  loading,
  prompt,
  selectedPrompt,
  onSelectPrompt,
  onUpdatePrompt,
  onDeletePrompt,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename(selectedPrompt);
    }
  };

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, prompt: Prompt) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('prompt', JSON.stringify(prompt));
    }
  };

  const handleRename = (prompt: Prompt) => {
    onUpdatePrompt(prompt, { key: 'name', value: renameValue });
    setRenameValue('');
    setIsRenaming(false);
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);
  return (
    <div className="relative flex items-center">
      {isRenaming && selectedPrompt.id === prompt.id ? (
        <div className="flex w-full items-center gap-3 bg-[#343541]/90 p-3">
          <IconPrompt size={18} />
          <input
            className="mr-12 flex-1 overflow-hidden overflow-ellipsis bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 ${
            loading ? 'disabled:cursor-not-allowed' : ''
          } ${selectedPrompt.id === prompt.id ? 'bg-[white]/5' : ''}`}
          onClick={() => onSelectPrompt(prompt)}
          disabled={loading}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, prompt)}
        >
          <IconPrompt
            size={18}
            style={{
              color: `${selectedPrompt.id === prompt.id ? '#FADA5E' : ''}`,
            }}
          />
          <div
            className={`relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3 ${
              selectedPrompt.id === prompt.id ? 'pr-12' : 'pr-1'
            }`}
          >
            {prompt.name}
          </div>
        </button>
      )}

      {(isDeleting || isRenaming) && selectedPrompt.id === prompt.id && (
        <div className="visible absolute right-1 z-10 flex text-gray-300">
          <button
            className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              if (isDeleting) {
                onDeletePrompt(prompt);
              } else if (isRenaming) {
                handleRename(prompt);
              }
              setIsDeleting(false);
              setIsRenaming(false);
            }}
          >
            <IconCheck size={18} />
          </button>
          <button
            className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleting(false);
              setIsRenaming(false);
            }}
          >
            <IconX size={18} />
          </button>
        </div>
      )}

      {selectedPrompt.id === prompt.id && !isDeleting && !isRenaming && (
        <div className="visible absolute right-1 z-10 flex text-gray-300">
          <button
            className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
              setRenameValue(selectedPrompt.name);
            }}
          >
            <IconPencil size={18} />
          </button>
          <button
            className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleting(true);
            }}
          >
            <IconTrash size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptComponent;
