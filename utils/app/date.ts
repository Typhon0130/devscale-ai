const padNumber = (number: number): string => {
  return number.toString().padStart(2, '0');
};

export const getDate = () => {
  const currentDate: Date = new Date();

  const monthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Los_Angeles',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  };

  const formattedDate: string = currentDate.toLocaleString('en-US', options);

  const temp = formattedDate.split(' ');

  const dateValue = temp[4] + ' on ' + temp[0] + ' ' + temp[1] + ' ' + temp[2];

  return dateValue;
};
