import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/format-date';
import { formatRupiah } from '@/lib/format-money';
import type { MasterProduct } from '@/support/models/masterProduct';
import {
    Barcode,
    Calendar,
    CalendarClock,
    FileText,
    Layers,
    Package,
    Ruler,
    Tag,
    TrendingUp,
    Wallet,
} from 'lucide-react';
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

    const margin = masterProduct.price - masterProduct.cost_price;
    const marginPercent =
        masterProduct.cost_price > 0
            ? ((margin / masterProduct.cost_price) * 100).toFixed(1)
            : '0';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto p-6 sm:max-w-xl">
                <div className="space-y-5">
                    {/* Header */}
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-lg font-bold leading-tight">
                                    {masterProduct.name}
                                </DialogTitle>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                    <Badge variant="secondary" className="text-xs">
                                        <Layers className="mr-1 h-3 w-3" />
                                        {masterProduct.category_name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        <Ruler className="mr-1 h-3 w-3" />
                                        {masterProduct.unit_name}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Wallet className="h-3.5 w-3.5" />
                                {t(
                                    'page.master_product.dialog_modal.detail_dialog.cost_price_label',
                                    'Harga Modal',
                                )}
                            </div>
                            <p className="text-sm font-semibold">
                                {formatRupiah(masterProduct.cost_price)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Tag className="h-3.5 w-3.5" />
                                {t(
                                    'page.master_product.dialog_modal.detail_dialog.price_label',
                                    'Harga Jual',
                                )}
                            </div>
                            <p className="text-sm font-semibold">
                                {formatRupiah(masterProduct.price)}
                            </p>
                        </div>
                    </div>

                    {/* Margin Info */}
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>
                                {t(
                                    'page.master_product.dialog_modal.detail_dialog.margin_label',
                                    'Margin Keuntungan',
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(margin)}
                            </span>
                            <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            >
                                {marginPercent}%
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Additional Details */}
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                            <FileText className="h-4 w-4 text-primary" />
                            {t(
                                'page.master_product.dialog_modal.detail_dialog.additional_info_title',
                                'Informasi Tambahan',
                            )}
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                            {/* Barcode */}
                            <div className="rounded-lg border bg-card p-3 shadow-xs">
                                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Barcode className="h-3.5 w-3.5" />
                                    {t(
                                        'page.master_product.dialog_modal.detail_dialog.barcode_label',
                                        'Barcode',
                                    )}
                                </div>
                                <p className="font-mono text-sm font-medium">
                                    {masterProduct.barcode !== ''
                                        ? masterProduct.barcode
                                        : '-'}
                                </p>
                            </div>

                            {/* Description */}
                            {masterProduct.desc && (
                                <div className="rounded-lg border bg-card p-3 shadow-xs">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <FileText className="h-3.5 w-3.5" />
                                        {t(
                                            'page.master_product.dialog_modal.detail_dialog.desc_label',
                                            'Deskripsi',
                                        )}
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground">
                                        {masterProduct.desc}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {t(
                                    'page.master_product.dialog_modal.detail_dialog.created_at_label',
                                    'Tanggal Dibuat',
                                )}
                            </div>
                            <p className="text-xs font-medium text-foreground">
                                {formatDate(masterProduct.created_at)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {t(
                                    'page.master_product.dialog_modal.detail_dialog.updated_at_label',
                                    'Tanggal Diperbarui',
                                )}
                            </div>
                            <p className="text-xs font-medium text-foreground">
                                {formatDate(masterProduct.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
