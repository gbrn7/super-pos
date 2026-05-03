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

      onSuccess();
    } catch (error) {
      console.error('Error deleting categories:', error);
      alert('Failed to delete categories');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  console.log("categories", categories)

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={isDisabled} variant="destructive" onClick={() => onBulkDeleteClick()}>
          <Trash2 className="h-4 w-4" />
          Delete {selectedLength}
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
          <AlertDialogTitle>Delete {selectedLength} Categories</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedLength} selected {selectedLength === 1 ? 'category' : 'categories'}?
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
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
