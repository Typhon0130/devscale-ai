import React from 'react';
import {
  IconArrowBarLeft,
  IconFolderPlus,
  IconMessagesOff,
  IconPlus,
} from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Folders } from '../Folders';
import { Search } from '../Search';

const PromptSidebar = () => {
  const { t } = useTranslation('prompt');
  return (
    <aside
      className={`fixed top-0 bottom-0 right-0 z-50 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <header className="mt-5 flex items-center justify-center">
        <button
          className="flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center justify-center gap-3 rounded-md border border-white/20 bg-primary p-3 text-center text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-bgPrimary"
          onClick={() => {
            console.log(1);
          }}
        >
          <IconPlus size={18} />
          {t('New Prompt')}
        </button>

        <button
          className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={() => console.log(1)}
        >
          <IconFolderPlus size={18} />
        </button>

        <IconArrowBarLeft
          className="ml-1 block cursor-pointer p-1 text-neutral-300 hover:text-neutral-400 sm:hidden"
          size={32}
          onClick={() => console.log(1)}
        />
      </header>

      {/* {conversations.length > 1 && (
        <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
      )} */}

      <div className="flex-grow overflow-y-auto overflow-x-clip">
        {/* {folders.length > 0 && (
          <div className="flex border-b border-white/20 pb-2">
            <Folders
              searchTerm={searchTerm}
              conversations={filteredConversations.filter(
                (conversation) => conversation.folderId !== 0,
              )}
              folders={folders}
              onDeleteFolder={onDeleteFolder}
              onUpdateFolder={onUpdateFolder}
              selectedConversation={selectedConversation}
              loading={loading}
              onSelectConversation={onSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onUpdateConversation={handleUpdateConversation}
            />
          </div>
        )} */}

        {/* {conversations.length > 0 ? (
          <div
            className="h-full w-full pt-2"
            onDrop={(e) => handleDrop(e)}
            onDragOver={allowDrop}
            onDragEnter={highlightDrop}
            onDragLeave={removeHighlight}
          >
            <Conversations
              loading={loading}
              conversations={filteredConversations.filter(
                (conversation) =>
                  conversation.folderId === 0 ||
                  !folders[conversation.folderId - 1],
              )}
              selectedConversation={selectedConversation}
              onSelectConversation={onSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onUpdateConversation={handleUpdateConversation}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="mt-8 select-none text-center text-white opacity-50">
              <IconMessagesOff className="mx-auto mb-3" />
              <span className="text-[12.5px] leading-3">
                {t('No Data.')}
              </span>
            </div>
          </div>
        )} */}
      </div>
    </aside>
  );
};

export default PromptSidebar;
