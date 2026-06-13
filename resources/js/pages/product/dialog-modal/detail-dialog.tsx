import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format-date';
import type { Product } from '@/support/models/product';
import { useTranslation } from 'react-i18next';

interface DetailSheetProps {
    isOpen: boolean;
    product: Product | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    product,
    onOpenChange,
}: DetailSheetProps) {
    const { t } = useTranslation();

    if (!product) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t("page.product.dialog_modal.detail_dialog.dialog_title", "Detail Produk")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.product.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{product.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.product.dialog_modal.detail_dialog.image_label", "Gambar")}
                            </p>
                            <div className="mt-2">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="h-32 w-32 object-cover rounded" />
                                ) : <p className="text-sm font-medium text-muted-foreground">-</p>}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.product.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(product.created_at)
                                }
                            </p>
                        </div>



                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.product.dialog_modal.detail_dialog.updated_at_label", "Tanggal Diperbarui")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(product.updated_at)
                                }
                            </p>
                        </div>

                    </DialogContent>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
