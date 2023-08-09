import React, { FC, useEffect, useState } from 'react';

interface Props {
  dateValue: string;
}

const Date: FC<Props> = ({ dateValue }) => {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    setDate(dateValue);
  }, [dateValue]);

  return (
    <div
      className={`absolute text-[#939799] ${
        window.innerWidth < 640
          ? 'right-11 bottom-1'
          : 'right-[-180px] top-[26px] m-0'
      } cursor-pointer text-[12px]`}
    >
      {date}
    </div>
  );
};

export default Date;
