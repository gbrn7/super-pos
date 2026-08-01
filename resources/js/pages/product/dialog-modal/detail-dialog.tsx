import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { STOCK_THRESHOLD } from '@/constants/Index';
import { formatDate } from '@/lib/format-date';
import { formatRupiah } from '@/lib/format-money';
import type { Product } from '@/support/models/product';
import {
    Archive,
    Barcode,
    Calendar,
    CalendarClock,
    Check,
    Circle,
    FileText,
    Image as ImageIcon,
    Infinity as InfinityIcon,
    Layers,
    Package,
    QrCode,
    Ruler,
    ShoppingBag,
    Tag,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';
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

    const margin = product.price - product.cost_price;
    const marginPercent =
        product.cost_price > 0
            ? ((margin / product.cost_price) * 100).toFixed(1)
            : '0';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto p-6 sm:max-w-2xl">
                <div className="space-y-5">
                    {/* Header */}
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-start gap-4">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-16 w-16 shrink-0 rounded-lg border object-cover shadow-xs"
                                />
                            ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                    <Package className="h-8 w-8 text-primary" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <DialogTitle className="text-xl font-bold leading-tight">
                                        {product.name}
                                    </DialogTitle>
                                    {product.is_active ? (
                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 gap-1 text-xs">
                                            <Check className="h-3 w-3" />
                                            {t('page.product.is_active.active', 'Aktif')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-slate-500/30 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 gap-1 text-xs">
                                            <X className="h-3 w-3" />
                                            {t('page.product.is_active.inactive', 'Tidak Aktif')}
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <Badge variant="secondary" className="text-xs">
                                        <Layers className="mr-1 h-3 w-3" />
                                        {product.category_name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        <Ruler className="mr-1 h-3 w-3" />
                                        {product.unit_name}
                                    </Badge>
                                    {product.sku && (
                                        <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                                            SKU: {product.sku}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Stock & Sales Info Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Archive className="h-3.5 w-3.5" />
                                {t('page.product.dialog_modal.detail_dialog.stock_label', 'Stok Saat Ini')}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                {product.is_unlimited ? (
                                    <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 gap-1 text-xs">
                                        <InfinityIcon className="h-3.5 w-3.5" />
                                        {t('page.product.is_unlimited.unlimited', 'Tidak Terbatas')}
                                    </Badge>
                                ) : (
                                    <>
                                        <p className="text-lg font-bold">
                                            {product.stock ?? 0} <span className="text-xs font-normal text-muted-foreground">{product.unit_name}</span>
                                        </p>
                                        {(product.stock ?? 0) <= STOCK_THRESHOLD ? (
                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                Menipis
                                            </Badge>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                {t('page.product.dialog_modal.detail_dialog.sold_quantity_label', 'Total Terjual')}
                            </div>
                            <p className="mt-1 text-lg font-bold text-foreground">
                                {product.sold_quantity ?? 0} <span className="text-xs font-normal text-muted-foreground">{product.unit_name}</span>
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Circle className="h-3.5 w-3.5" />
                                {t('page.product.dialog_modal.detail_dialog.is_unlimited_label', 'Tipe Stok')}
                            </div>
                            <p className="mt-1 text-sm font-semibold">
                                {product.is_unlimited
                                    ? t('page.product.is_unlimited.unlimited', 'Tidak Terbatas')
                                    : t('page.product.is_unlimited.limited', 'Terbatas')}
                            </p>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Wallet className="h-3.5 w-3.5" />
                                {t(
                                    'page.product.dialog_modal.detail_dialog.cost_price_label',
                                    'Harga Modal',
                                )}
                            </div>
                            <p className="text-base font-semibold">
                                {formatRupiah(product.cost_price)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Tag className="h-3.5 w-3.5" />
                                {t(
                                    'page.product.dialog_modal.detail_dialog.price_label',
                                    'Harga Jual',
                                )}
                            </div>
                            <p className="text-base font-semibold text-primary">
                                {formatRupiah(product.price)}
                            </p>
                        </div>
                    </div>

                    {/* Margin Info */}
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span>
                                {t(
                                    'page.product.dialog_modal.detail_dialog.margin_label',
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
                                +{marginPercent}%
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Additional Details */}
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                            <FileText className="h-4 w-4 text-primary" />
                            {t(
                                'page.product.dialog_modal.detail_dialog.additional_info_title',
                                'Informasi Identitas & Kode',
                            )}
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Barcode */}
                            <div className="rounded-lg border bg-card p-3 shadow-xs">
                                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Barcode className="h-3.5 w-3.5" />
                                    {t(
                                        'page.product.dialog_modal.detail_dialog.barcode_label',
                                        'Barcode',
                                    )}
                                </div>
                                <p className="font-mono text-sm font-medium">
                                    {product.barcode !== '' && product.barcode !== null
                                        ? product.barcode
                                        : '-'}
                                </p>
                            </div>

                            {/* SKU */}
                            <div className="rounded-lg border bg-card p-3 shadow-xs">
                                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <QrCode className="h-3.5 w-3.5" />
                                    {t(
                                        'page.product.dialog_modal.detail_dialog.sku_label',
                                        'SKU',
                                    )}
                                </div>
                                <p className="font-mono text-sm font-medium">
                                    {product.sku !== '' && product.sku !== null
                                        ? product.sku
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {product.desc && (
                            <div className="rounded-lg border bg-card p-3 shadow-xs">
                                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5" />
                                    {t(
                                        'page.product.dialog_modal.detail_dialog.desc_label',
                                        'Deskripsi',
                                    )}
                                </div>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {product.desc}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {t(
                                    'page.product.dialog_modal.detail_dialog.created_at_label',
                                    'Tanggal Dibuat',
                                )}
                            </div>
                            <p className="text-xs font-medium text-foreground">
                                {formatDate(product.created_at)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {t(
                                    'page.product.dialog_modal.detail_dialog.updated_at_label',
                                    'Tanggal Diperbarui',
                                )}
                            </div>
                            <p className="text-xs font-medium text-foreground">
                                {formatDate(product.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
