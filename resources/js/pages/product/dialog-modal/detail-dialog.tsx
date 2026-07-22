import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { STOCK_THRESHOLD } from '@/constants/Index';
import { formatDate } from '@/lib/format-date';
import { formatRupiah } from '@/lib/format-money';
import type { Product } from '@/support/models/product';
import { Check, Circle, Infinity, X } from 'lucide-react';
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
                <DialogContent className="max-h-[90vh] max-w-170! overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {t(
                                'page.product.dialog_modal.detail_dialog.dialog_title',
                                'Detail Produk',
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="dialog-body grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.name_label',
                                    'Nama',
                                )}
                            </p>
                            <p className="mt-1 text-base">{product.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.unit_label',
                                    'Nama Satuan',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {product.unit_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.category_name_label',
                                    'Nama Kategori',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {product.category_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.cost_price_label',
                                    'Harga Modal',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {formatRupiah(product.cost_price)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.price_label',
                                    'Harga Jual',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {formatRupiah(product.price)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.barcode_label',
                                    'Barcode',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {product.barcode != '' ? product.barcode : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.is_unlimited_label',
                                    'Tipe Stok',
                                )}
                            </p>
                            {product.is_unlimited ? (
                                <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                    <Infinity size={184} strokeWidth={2.25} />
                                    {t(
                                        'page.product.is_unlimited.unlimited',
                                        'Tidak Terbatas',
                                    )}
                                </Badge>
                            ) : (
                                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    <Circle size={184} strokeWidth={2.25} />
                                    {t(
                                        'page.product.is_unlimited.limited',
                                        'Terbatas',
                                    )}
                                </Badge>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.stock_label',
                                    'Stok',
                                )}
                            </p>
                            {product.stock ? (
                                product.stock > STOCK_THRESHOLD ? (
                                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                        {product.stock}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                        {product.stock}
                                    </Badge>
                                )
                            ) : (
                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                    {product.stock}
                                </Badge>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.is_active_label',
                                    'Status',
                                )}
                            </p>
                            {product.is_active ? (
                                <Badge className="mt-1 bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                                    <Check size={184} strokeWidth={2.25} />
                                    {t(
                                        'page.product.is_active.active',
                                        'Aktif',
                                    )}
                                </Badge>
                            ) : (
                                <Badge className="mt-1 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                    <X size={184} strokeWidth={2.25} />
                                    {t(
                                        'page.product.is_active.inactive',
                                        'Tidak Aktif',
                                    )}
                                </Badge>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.desc_label',
                                    'Deskripsi',
                                )}
                            </p>
                            <p className="mt-1 text-base">{product.desc}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.sku_label',
                                    'SKU',
                                )}
                            </p>
                            <p className="mt-1 text-base">{product.sku}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.created_at_label',
                                    'Tanggal Dibuat',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {formatDate(product.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.updated_at_label',
                                    'Tanggal Diperbarui',
                                )}
                            </p>
                            <p className="mt-1 text-base">
                                {formatDate(product.updated_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'page.product.dialog_modal.detail_dialog.image_label',
                                    'Gambar',
                                )}
                            </p>
                            <div className="mt-2">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-32 w-32 rounded object-cover"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-muted-foreground">
                                        -
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </DialogContent>
        </Dialog>
    );
}
