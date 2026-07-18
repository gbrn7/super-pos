import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bulkDelete } from '@/routes/apiTransactions';
import axiosInstance from '@/lib/axios';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface BulkDeleteDialogProps {
    isDisabled: boolean;
    selectedLength: number;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    transactions: Transaction[];
    onSuccess: () => void;
    onBulkDeleteClick?: () => void;
}

export function BulkDeleteDialog({
    isDisabled,
    selectedLength,
    isOpen,
    setOpen,
    transactions,
    onSuccess,
    onBulkDeleteClick,
}: BulkDeleteDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleBulkDelete = async () => {
        try {
            setLoading(true);
            const ids = transactions.map((t) => t.id);
            const res = await axiosInstance.post<ResponseApi<null>>(
                bulkDelete().url,
                { ids },
            );

            if (res.data.success) {
                showSuccessToast(
                    res.data.message ||
                        t('page.transaction.dialog_modal.bulk_delete_dialog.success_message', 'Transaksi terpilih berhasil dihapus'),
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
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    disabled={isDisabled}
                    onClick={onBulkDeleteClick}
                >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    {t('component.data_table.bulk_delete_btn', 'Hapus Terpilih')} ({selectedLength})
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('page.transaction.dialog_modal.bulk_delete_dialog.title', 'Hapus Beberapa Transaksi')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            'page.transaction.dialog_modal.bulk_delete_dialog.description',
                            `Apakah Anda yakin ingin menghapus ${selectedLength} transaksi terpilih? Tindakan ini tidak dapat dibatalkan.`,
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {t('component.dialog.cancel_btn', 'Batal')}
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={loading}
                    >
                        {loading ? t('component.dialog.loading', 'Memproses...') : t('component.dialog.delete_btn', 'Hapus')}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
