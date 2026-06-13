import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format-date';
import type { Unit } from '@/support/models/unit';
import { useTranslation } from 'react-i18next';

interface DetailSheetProps {
    isOpen: boolean;
    unit: Unit | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    unit,
    onOpenChange,
}: DetailSheetProps) {
    const { t } = useTranslation();

    if (!unit) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("page.unit.dialog_modal.detail_dialog.dialog_title", "Detail Satuan")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.unit.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{unit.name}</p>
                        </div>


                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.unit.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(unit.created_at)
                                }
                            </p>
                        </div>



                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.unit.dialog_modal.detail_dialog.updated_at_label", "Tanggal Diperbarui")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(unit.updated_at)
                                }
                            </p>
                        </div>

                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
