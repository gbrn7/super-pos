import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format-date';
import { formatRupiah } from '@/lib/format-money';
import type { MasterProduct } from '@/support/models/masterProduct';
import { useTranslation } from 'react-i18next';

interface DetailSheetProps {
    isOpen: boolean;
    masterProduct: MasterProduct | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    masterProduct,
    onOpenChange,
}: DetailSheetProps) {
    const { t } = useTranslation();

    if (!masterProduct) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={true}>
                <DialogContent className="max-w-170! max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("page.master_product.dialog_modal.detail_dialog.dialog_title", "Detail Master Produk")}</DialogTitle>
                    </DialogHeader>
                    <div className="dialog-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.name_label", "Nama")}
                            </p>
                            <p className="mt-1 text-base">{masterProduct.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.unit_label", "Nama Satuan")}
                            </p>
                            <p className="mt-1 text-base">{masterProduct.unit_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.category_name_label", "Nama Kategori")}
                            </p>
                            <p className="mt-1 text-base">{masterProduct.category_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.cost_price_label", "Harga Modal")}
                            </p>
                            <p className="mt-1 text-base">{formatRupiah(masterProduct.cost_price)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.price_label", "Harga Jual")}
                            </p>
                            <p className="mt-1 text-base">{formatRupiah(masterProduct.price)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.barcode_label", "Barcode")}
                            </p>
                            <p className="mt-1 text-base">{masterProduct.barcode != '' ? masterProduct.barcode : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.desc_label", "Deskripsi")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    masterProduct.desc
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.created_at_label", "Tanggal Dibuat")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(masterProduct.created_at)
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t("page.master_product.dialog_modal.detail_dialog.updated_at_label", "Tanggal Diperbarui")}
                            </p>
                            <p className="mt-1 text-base">
                                {
                                    formatDate(masterProduct.updated_at)
                                }
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </DialogContent>
        </Dialog>
    );
}
