import dayjs from 'dayjs';

export const formatDate = (epoch: number) => {
  return dayjs.unix(epoch).format('DD/MM/YYYY HH:mm');
};