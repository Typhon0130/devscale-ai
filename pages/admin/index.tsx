import React from 'react';
import Image from 'next/image';

const Admin = () => {
  /**
   * *Important Information is highlighted
   * ! Not Completed
   * ? How can I fix this code
   * TODO: Get the data from the online folders
   * @param url
   */
  const handleEmbedding = () => {
    const url = process.env.GOOGLE_DRIVE_FOLDER_ID;
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-12 bg-[#343542]">
      <div className="flex-2 flex w-full items-start">
        <Image src="/favicon.png" alt="Pacific AI" width={100} height={100} />
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
        <div className="whitespace- flex w-[95%] max-w-[1200px] items-center justify-center break-all	bg-[#444654] py-6 text-center text-sm leading-[24px] text-[#d1d5db]	">
          Your Source Folder Url
        </div>
        <button
          className="flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center justify-center gap-3 rounded-sm border border-white/20 bg-primary px-3 py-4 text-center text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-bgPrimary"
          onClick={handleEmbedding}
        >
          Start Embedding
        </button>
      </div>
    </div>
  );
};

export default Admin;
