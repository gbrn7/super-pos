import axios from 'axios';
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
import { update as deleteCategory } from '@/routes/apiCategories';
import type { Category } from '@/support/models/category';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { t } from 'i18next';

interface DeleteDialogProps {
    isOpen: boolean;
    onSuccess: () => void;
    category: Category | null;
    setOpen: (open: boolean) => void;
}

export function DeleteDialog({
    isOpen,
    onSuccess,
    category,
    setOpen,
}: DeleteDialogProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        try {
            setLoading(true);

            await axios.delete(deleteCategory(category?.id || '').url);

            onSuccess();
            toast.success("Delete category successfully")
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.success("Failed to delete category")
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
                    <AlertDialogTitle>{t("category.dialog_modal.delete_dialog.dialog_title", "Hapus Data")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("category.dialog_modal.delete_dialog.dialog_desc", "Apakah anda yakin akan menghapus data ini ?")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        variant={'outline'}
                        onClick={() => setOpen(false)}
                    >
                        {t("category.dialog_modal.delete_dialog.cancel_button", "Batal")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        variant="destructive"
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : t("category.dialog_modal.delete_dialog.confirm_button", "Hapus Kategori")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
