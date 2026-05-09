import axios from 'axios';
import { Trash2, Trash2Icon } from 'lucide-react';
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
import { bulkDelete } from '@/routes/apiCategories';
import type { Category } from '@/support/models/category';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { t } from 'i18next';
import { sprintf } from 'sprintf-js';

interface BulkDeleteDialogProps {
  isDisabled: boolean,
  selectedLength: number,
  isOpen: boolean;
  onSuccess: () => void;
  categories: Category[];
  setOpen: (open: boolean) => void;
  onBulkDeleteClick: () => void;
}

export function BulkDeleteDialog({
  isDisabled,
  selectedLength,
  isOpen,
  onSuccess,
  categories,
  setOpen,
  onBulkDeleteClick
}: BulkDeleteDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleBulkDelete = async () => {
    try {
      setLoading(true);

      const ids = categories.map((cat) => cat.id);
      await axios.post(bulkDelete().url, { ids });

      toast.success("Delete categories successfully")
      onSuccess();
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast.error("Failed to delete categories")
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };


  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={isDisabled} variant="destructive" onClick={() => onBulkDeleteClick()}>
          <Trash2 className="h-4 w-4" />
          {sprintf
            (
              t("page.category.dialog_modal.bulk_delete_dialog.dialog_button", "Hapus %d kategori"),
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
                t("page.category.dialog_modal.bulk_delete_dialog.dialog_title", "Hapus %d kategori"),
                selectedLength)
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {sprintf(t("page.category.dialog_modal.bulk_delete_dialog.dialog_desc", "Apakah anda yakin akan menghapus %d kategori ?"), selectedLength)}
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
            {loading ? <Spinner /> : t("page.category.dialog_modal.bulk_delete_dialog.confirm_button", "Hapus Kategori")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
