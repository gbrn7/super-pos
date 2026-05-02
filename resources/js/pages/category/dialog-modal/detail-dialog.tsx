import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Category } from '@/support/models/category';

interface DetailSheetProps {
    isOpen: boolean;
    category: Category | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    category,
    onOpenChange,
}: DetailSheetProps) {
    if (!category) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>Detail Category</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Name
                            </p>
                            <p className="mt-1 text-base">{category.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Description
                            </p>
                            <p className="mt-1 text-base">
                                {category.desc || '-'}
                            </p>
                        </div>

                        {category.created_at && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Created At
                                </p>
                                <p className="mt-1 text-base">
                                    {new Date(
                                        category.created_at,
                                    ).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        )}

                        {category.updated_at && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Updated At
                                </p>
                                <p className="mt-1 text-base">
                                    {new Date(
                                        category.updated_at,
                                    ).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        )}
                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
