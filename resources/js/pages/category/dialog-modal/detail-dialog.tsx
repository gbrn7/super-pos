import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format-date';
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


                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.category.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(category.created_at)
                                }
                            </p>
                        </div>



                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.category.dialog_modal.detail_dialog.updated_at_label", "Tanggal Diperbarui")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(category.updated_at)
                                }
                            </p>
                        </div>

                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
