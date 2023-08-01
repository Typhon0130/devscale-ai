import React from 'react';

const Date = () => {
  return (
    <div
      className={`absolute ${
        window.innerWidth < 640
          ? 'right-11 bottom-1'
          : 'right-[-140px] top-[26px] m-0'
      } cursor-pointer text-[12px]`}
    >
      2023/04/30 06:40
    </div>
  );
};

export default Date;
