import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Category } from '@/support/models/category';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    if (!category) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("page.category.dialog_modal.detail_dialog.dialog_title", "Detail Kategori")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.category.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{category.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.category.dialog_modal.detail_dialog.desc_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">
                                {category.desc || '-'}
                            </p>
                        </div>

                        {category.created_at && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t("page.category.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
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
                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
