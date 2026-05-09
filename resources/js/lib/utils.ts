import { ResponseApi } from '@/support/interfaces/response/Response';
import { ResponseErrorApi } from '@/support/interfaces/response/ResponseError';
import type { InertiaLinkProps } from '@inertiajs/react';
import axios from 'axios';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}



export function handleApiError<T = ResponseErrorApi>(
    error: unknown,
    callback?: (data: T) => void
) {
    if (axios.isAxiosError<T>(error)) {
        const data = error.response?.data;

        // callback
        if (data && callback) {
            callback(data);
        }

        // default toast
        const message =
            (data as ResponseErrorApi)?.message ??
            'Something went wrong';

        toast.error(message);

        return;
    }

    toast.error('Unknown error occurred');
}