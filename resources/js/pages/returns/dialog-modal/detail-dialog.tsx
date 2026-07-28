import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ShoppingBag, Package } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatRupiah } from '@/lib/format-money';
import type { ReturnItem } from '../columns';

interface DetailDialogProps {
    isOpen: boolean;
    returnItem: ReturnItem | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    returnItem,
    onOpenChange,
}: DetailDialogProps) {
    const { t } = useTranslation();

    if (!returnItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto p-6 sm:max-w-2xl">
                <div className="space-y-6">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    {t('page.return.dialog_modal.detail_title', 'Detail Retur Barang')}
                                </DialogTitle>
                                <p className="mt-1 font-mono text-sm text-muted-foreground">
                                    #{returnItem.return_number}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* General Information */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                {t('page.return.invoice_label', 'No. Invoice Struk')}
                            </div>
                            <p className="text-sm font-semibold">
                                {returnItem.transaction?.invoice_number || '-'}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                {t('page.return.cashier_label', 'Kasir / Petugas')}
                            </div>
                            <p className="text-sm font-semibold">
                                {returnItem.user?.name || '-'}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {t('page.return.date_label', 'Waktu Retur')}
                            </div>
                            <p className="text-xs font-medium text-foreground">
                                {new Date(returnItem.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* Returned Items Table */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-primary" />
                            {t('page.return.items_title', 'Produk yang Dikembalikan')}
                        </h4>
                        <div className="w-full overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>{t('page.return.product_name', 'Produk')}</TableHead>
                                        <TableHead className="text-center">{t('page.return.qty', 'Jumlah')}</TableHead>
                                        <TableHead className="text-right">{t('page.return.price_per_unit', 'Harga Satuan')}</TableHead>
                                        <TableHead className="text-right">{t('page.return.subtotal', 'Subtotal')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returnItem.details && returnItem.details.length > 0 ? (
                                        returnItem.details.map((detail) => (
                                            <TableRow key={detail.id}>
                                                <TableCell className="font-medium">
                                                    {detail.product?.name || 'Produk'}
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {detail.quantity}
                                                </TableCell>
                                                <TableCell className="text-right text-xs">
                                                    {formatRupiah(detail.price_per_unit)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatRupiah(detail.subtotal)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                                                {t('page.return.no_items', 'Tidak ada rincian produk.')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Financial Summary Breakdown */}
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                        {returnItem.reason && (
                            <div className="mb-2 border-b pb-2">
                                <span className="text-xs text-muted-foreground block">{t('page.return.reason_label', 'Catatan Alasan Retur:')}</span>
                                <p className="text-sm italic text-foreground mt-0.5">{returnItem.reason}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-muted-foreground">
                                {t('page.return.total_refund_label', 'Total Dana Refund')}
                            </span>
                            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                {formatRupiah(returnItem.total_refund_amount)}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
