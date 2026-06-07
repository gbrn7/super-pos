import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/formatdate';
import type { PaymentMethod } from '@/support/models/paymentMethod';
import { useTranslation } from 'react-i18next';

interface DetailSheetProps {
    isOpen: boolean;
    paymentMethod: PaymentMethod | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    paymentMethod,
    onOpenChange,
}: DetailSheetProps) {
    const { t } = useTranslation();

    if (!paymentMethod) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("page.payment_method.dialog_modal.detail_dialog.dialog_title", "Detail Metode Pembayaran")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.payment_method.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{paymentMethod.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.payment_method.dialog_modal.detail_dialog.image_label", "Gambar")}
                            </p>
                            <div className="mt-2">
                                {paymentMethod.image ? (
                                    <img src={paymentMethod.image} alt={paymentMethod.name} className="h-32 w-32 object-cover rounded" />
                                ) : <p className="text-sm font-medium text-muted-foreground">-</p>}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.payment_method.dialog_modal.detail_dialog.desc_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">
                                {paymentMethod.desc || '-'}
                            </p>
                        </div>


                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.payment_method.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(paymentMethod.created_at)
                                }
                            </p>
                        </div>



                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.payment_method.dialog_modal.detail_dialog.updated_at_label", "Tanggal Diperbarui")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(paymentMethod.updated_at)
                                }
                            </p>
                        </div>

                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
