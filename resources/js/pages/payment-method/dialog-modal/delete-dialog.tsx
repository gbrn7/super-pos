import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { update as deletePaymentMethod } from '@/routes/apiPaymentMethods';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import { Spinner } from '@/components/ui/spinner';
import { t } from 'i18next';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { ResponseApi } from '@/support/interfaces/response/Response';
import axiosInstance from '@/lib/axios';

interface DeleteDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    paymentMethod: PaymentMethod | null;
    setOpen: (open: boolean) => void;
}

export function DeleteDialog({
    isOpen,
    onSuccess,
    paymentMethod,
    setOpen,
}: DeleteDialogProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        try {
            setLoading(true);

            const res = await axiosInstance.delete<ResponseApi<boolean>>(deletePaymentMethod(paymentMethod?.id || '').url);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            onSuccess();
            showSuccessToast(res.data.message)
        } catch (error) {
            console.error('Error deleting paymentMethod:', error);
            handleApiError(error)
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            <AlertDialogContent
                size="sm"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>{t("page.payment_method.dialog_modal.delete_dialog.dialog_title", "Hapus Data")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("page.payment_method.dialog_modal.delete_dialog.dialog_desc", "Apakah anda yakin akan menghapus data ini ?")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        variant={'outline'}
                        onClick={() => setOpen(false)}
                    >
                        {t("page.payment_method.dialog_modal.delete_dialog.cancel_button", "Batal")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        variant="destructive"
                        disabled={loading}
                        className='w-full'
                    >
                        {loading ? <Spinner /> : t("page.payment_method.dialog_modal.delete_dialog.confirm_button", "Hapus Metode Pembayaran")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
