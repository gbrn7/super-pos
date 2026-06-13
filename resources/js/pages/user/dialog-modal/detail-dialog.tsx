import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format-date';
import type { User } from '@/support/models/user';
import { useTranslation } from 'react-i18next';

interface DetailSheetProps {
    isOpen: boolean;
    user: User | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    user,
    onOpenChange,
}: DetailSheetProps) {
    const { t } = useTranslation();

    if (!user) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("page.user.dialog_modal.detail_dialog.dialog_title", "Detail Kategori")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.user.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{user.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.user.dialog_modal.detail_dialog.email_label", "Email")}
                            </p>
                            <p className="mt-1 text-base">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.user.dialog_modal.detail_dialog.role_label", "Peran")}
                            </p>
                            <p className="mt-1 text-base">
                                {user.role}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.user.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(user.created_at)
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.user.dialog_modal.detail_dialog.updated_at_label", "Tanggal Diperbarui")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(user.updated_at)
                                }
                            </p>
                        </div>
                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
