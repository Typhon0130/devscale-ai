import { KeyValuePair, Prompt } from '@/types';
import React, { FC } from 'react';
import PromptComponent from './Prompt';

interface Props {
  loading: boolean;
  prompts: Prompt[];
  selectedPrompt: Prompt;
  onSelectPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (prompt: Prompt) => void;
  onUpdatePrompt: (prompt: Prompt, data: KeyValuePair[]) => void;
}

const Prompts: FC<Props> = ({
  loading,
  prompts,
  selectedPrompt,
  onSelectPrompt,
  onDeletePrompt,
  onUpdatePrompt,
}) => {
  return (
    <div className="flex w-full flex-col gap-1 pt-2">
      {prompts
        .slice()
        .reverse()
        .map((prompt, index) => (
          <PromptComponent
            key={index}
            selectedPrompt={selectedPrompt}
            prompt={prompt}
            loading={loading}
            onSelectPrompt={onSelectPrompt}
            onDeletePrompt={onDeletePrompt}
            onUpdatePrompt={onUpdatePrompt}
          />
        ))}
    </div>
  );
};

export default Prompts;
