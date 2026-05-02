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
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
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
                    <AlertDialogTitle>Delete Data</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure delete this data?
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
                        onClick={handleDelete}
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
