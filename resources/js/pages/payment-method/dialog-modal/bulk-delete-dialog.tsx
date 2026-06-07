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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { bulkDelete } from '@/routes/apiPaymentMethods';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { t } from 'i18next';
import { sprintf } from 'sprintf-js';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { ResponseApi } from '@/support/interfaces/response/Response';

interface BulkDeleteDialogProps {
  isDisabled: boolean,
  selectedLength: number,
  isOpen: boolean;
  onSuccess: () => void;
  paymentMethods: PaymentMethod[];
  setOpen: (open: boolean) => void;
  onBulkDeleteClick: () => void;
}

export function BulkDeleteDialog({
  isDisabled,
  selectedLength,
  isOpen,
  onSuccess,
  paymentMethods,
  setOpen,
  onBulkDeleteClick
}: BulkDeleteDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleBulkDelete = async () => {
    try {
      setLoading(true);

      const ids = paymentMethods.map((cat) => cat.id);
      const res = await axiosInstance.post<ResponseApi<boolean>>(bulkDelete().url, { ids });

      if (!res.data.success) {
        showWarningToast(res.data.message)
        return
      }

      showSuccessToast(res.data.message)
      onSuccess();
    } catch (error) {
      console.error('Error deleting paymentMethods:', error);
      handleApiError(error)
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };


  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={isDisabled} variant="outline" onClick={() => onBulkDeleteClick()}>
          <Trash2Icon className="h-4" />
          {sprintf
            (
              t("page.payment_method.dialog_modal.bulk_delete_dialog.dialog_button", "Hapus"),
              selectedLength)
          }
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        size="sm"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {sprintf
              (
                t("page.payment_method.dialog_modal.bulk_delete_dialog.dialog_title", "Hapus %d metode pembayaran"),
                selectedLength)
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {sprintf(t("page.payment_method.dialog_modal.bulk_delete_dialog.dialog_desc", "Apakah anda yakin akan menghapus %d metode pembayaran ?"), selectedLength)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            variant={'outline'}
            onClick={() => setOpen(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            variant="destructive"
            disabled={loading}
          >
            {loading ? <Spinner /> : t("page.payment_method.dialog_modal.bulk_delete_dialog.confirm_button", "Hapus Metode pembayaran")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
