import { FILTER_DEFAULT_VALUE, TOASTPOSITIONDEFAULT } from '@/constants/Index';
import { ResponseErrorApi } from '@/support/interfaces/response/ResponseError';
import type { InertiaLinkProps } from '@inertiajs/react';
import axios from 'axios';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { t } from 'i18next';
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

        if ((data as ResponseErrorApi)?.errors) {
            showValidationErrors((data as ResponseErrorApi)?.errors)
            return;
        }

        // default toast
        const message =
            (data as ResponseErrorApi)?.message ??
            t("error.default", "Kesalahan sistem internal");


        showErrorToast(message)

        return;
    }

    toast.error('Unknown error occurred');
}

export function showValidationErrors(
    errors: Record<string, string[]>
) {
    Object.values(errors).forEach((fieldErrors) => {
        fieldErrors.forEach((message) => {
            showErrorToast(message)
        })
    })
}

export function showToast(message: string) {
    toast(message, { position: TOASTPOSITIONDEFAULT, className: 'capitalize' })
}

export function showInfoToast(message: string) {
    toast.info(message, { position: TOASTPOSITIONDEFAULT, className: 'capitalize' })
}

export function showErrorToast(message: string) {
    toast.error(message, { position: TOASTPOSITIONDEFAULT, className: 'capitalize' })
}

export function showWarningToast(message: string) {
    toast.warning(message, { position: TOASTPOSITIONDEFAULT, className: 'capitalize' })
}

export function showSuccessToast(message: string) {
    toast.success(message, { position: TOASTPOSITIONDEFAULT, className: 'capitalize' })
}

export const getNumberFilterValue = (value: number | null) => (
    value == null ? FILTER_DEFAULT_VALUE : value.toString()
);


export const getNullableNumberFilterValue = (value: string) => (
    value === FILTER_DEFAULT_VALUE ? null : Number(value)
);