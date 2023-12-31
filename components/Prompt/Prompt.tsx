import { KeyValuePair, Prompt } from '@/types';
import { IconCheck, IconTrash, IconX, IconPrompt } from '@tabler/icons-react';
import React, { DragEvent, FC, useEffect, useState } from 'react';
import { PromptModal } from './PromptModal';

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
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, prompt: Prompt) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('prompt', JSON.stringify(prompt));
    }
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
      <button
        className={`prompt-button flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition duration-200  ease-in-out hover:bg-[white]/5 ${
          loading ? 'disabled:cursor-not-allowed' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        disabled={loading}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, prompt)}
      >
        <IconPrompt size={18} className="prompt-icon" />
        <div
          className={`relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3 ${
            selectedPrompt.id === prompt.id ? 'pr-12' : 'pr-1'
          }`}
        >
          {prompt.name}
        </div>
      </button>

      {(isDeleting || isRenaming) && (
        <div className="visible absolute right-1 z-10 flex text-gray-300">
          <button
            className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
            onClick={(e) => {
              e.stopPropagation();
              if (isDeleting) {
                onDeletePrompt(prompt);
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

      {!isDeleting && !isRenaming && (
        <div className="visible absolute right-1 z-10 flex text-gray-300">
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
      {showModal && (
        <PromptModal
          prompt={prompt}
          onClose={() => setShowModal(false)}
          onUpdatePrompt={onUpdatePrompt}
        />
      )}
    </div>
  );
};

export default PromptComponent;
