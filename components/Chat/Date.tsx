import React from 'react';

const Date = () => {
  return (
    <div
      className={`absolute text-[#939799] ${
        window.innerWidth < 640
          ? 'right-11 bottom-1'
          : 'right-[-160px] top-[26px] m-0'
      } cursor-pointer text-[12px]`}
    >
      06:30 on Aug 09, 2023
    </div>
  );
};

export default Date;
