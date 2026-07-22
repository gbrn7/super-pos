import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { destroy } from '@/routes/apiTransactions';
import axiosInstance from '@/lib/axios';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { Transaction } from '@/support/models/transaction';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    transaction: Transaction | null;
    onSuccess: () => void;
}

export function DeleteDialog({
    isOpen,
    setOpen,
    transaction,
    onSuccess,
}: DeleteDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    if (!transaction) {
        return null;
    }

    const handleDelete = async () => {
        try {
            setLoading(true);
            const deleteUrl = destroy(transaction.id).url;
            const res =
                await axiosInstance.delete<ResponseApi<null>>(deleteUrl);

            if (res.data.success) {
                showSuccessToast(
                    res.data.message ||
                        t(
                            'page.transaction.dialog_modal.delete_dialog.success_message',
                            'Transaksi berhasil dihapus',
                        ),
                );
                setOpen(false);
                onSuccess();
            } else {
                showWarningToast(res.data.message);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t(
                            'page.transaction.dialog_modal.delete_dialog.title',
                            'Hapus Transaksi',
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            'page.transaction.dialog_modal.delete_dialog.description',
                            'Apakah Anda yakin ingin menghapus transaksi invoice ini? Tindakan ini tidak dapat dibatalkan.',
                        )}
                        <div className="mt-2 font-mono font-semibold text-foreground">
                            Invoice: #{transaction.invoice_number}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {t('component.dialog.cancel_btn', 'Batal')}
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading
                            ? t('component.dialog.loading', 'Memproses...')
                            : t('component.dialog.delete_btn', 'Hapus')}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
