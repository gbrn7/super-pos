import dayjs from 'dayjs';

export const formatDate = (dateInput: string | number | Date | null | undefined) => {
    if (!dateInput) return '-';
    if (typeof dateInput === 'number') {
        return dayjs.unix(dateInput).format('DD/MM/YYYY HH:mm');
    }
    return dayjs(dateInput).format('DD/MM/YYYY HH:mm');
};
