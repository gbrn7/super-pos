import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/formatdate';
import type { Role } from '@/support/models/role';
import { useTranslation } from 'react-i18next';

interface DetailSheetProps {
    isOpen: boolean;
    role: Role | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    role,
    onOpenChange,
}: DetailSheetProps) {
    const { t } = useTranslation();

    if (!role) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("page.role.dialog_modal.detail_dialog.dialog_title", "Detail Peran")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.role.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{role.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.role.dialog_modal.detail_dialog.desc_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">
                                {role.guard_name || '-'}
                            </p>
                        </div>

                        {role.created_at && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t("page.role.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                                </p>
                                <p className="mt-1 text-base">
                                    {formatDate(role.created_at)}
                                </p>
                            </div>
                        )}
                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
