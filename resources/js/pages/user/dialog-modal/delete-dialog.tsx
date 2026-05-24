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
import { update as deleteUser } from '@/routes/apiCategories';
import type { User } from '@/support/models/user';
import { Spinner } from '@/components/ui/spinner';
import { t } from 'i18next';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/utils';
import { ResponseApi } from '@/support/interfaces/response/Response';
import axiosInstance from '@/lib/axios';

interface DeleteDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    user: User | null;
    setOpen: (open: boolean) => void;
}

export function DeleteDialog({
    isOpen,
    onSuccess,
    user,
    setOpen,
}: DeleteDialogProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        try {
            setLoading(true);

            const res = await axiosInstance.delete<ResponseApi<boolean>>(deleteUser(user?.id || '').url);

            if (!res.data.success) {
                showWarningToast(res.data.message)
                return
            }

            onSuccess();
            showSuccessToast(res.data.message)
        } catch (error) {
            console.error('Error deleting user:', error);
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
                    <AlertDialogTitle>{t("page.user.dialog_modal.delete_dialog.dialog_title", "Hapus Data")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("page.user.dialog_modal.delete_dialog.dialog_desc", "Apakah anda yakin akan menghapus data ini ?")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        variant={'outline'}
                        onClick={() => setOpen(false)}
                    >
                        {t("page.user.dialog_modal.delete_dialog.cancel_button", "Batal")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        variant="destructive"
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : t("page.user.dialog_modal.delete_dialog.confirm_button", "Hapus Kategori")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
