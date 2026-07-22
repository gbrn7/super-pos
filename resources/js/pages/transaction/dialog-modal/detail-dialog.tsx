import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { formatRupiah } from '@/lib/format-money';
import { handleApiError } from '@/lib/utils';
import { show as apiShowTransaction } from '@/routes/apiTransactions';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { Transaction } from '@/support/models/transaction';
import dayjs from 'dayjs';
import { CreditCard, Calendar, User, Printer, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DetailDialogProps {
    isOpen: boolean;
    transaction: Transaction | null;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({
    isOpen,
    transaction,
    onOpenChange,
}: DetailDialogProps) {
    const { t } = useTranslation();
    const [detailData, setDetailData] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && transaction?.id) {
            let isMounted = true;
            setLoading(true);
            const apiUrl = apiShowTransaction(transaction.id).url;
            axiosInstance
                .get<ResponseApi<Transaction>>(apiUrl)
                .then((res) => {
                    if (isMounted && res.data.success && res.data.data) {
                        setDetailData(res.data.data);
                    }
                })
                .catch((err) => {
                    if (isMounted) {
                        handleApiError(err);
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                });

            return () => {
                isMounted = false;
            };
        } else if (!isOpen) {
            setDetailData(null);
            setLoading(false);
        }
    }, [isOpen, transaction?.id]);

    if (!transaction) {
        return null;
    }

    const currentTransaction = detailData || transaction;
    const discountAmount = Number(currentTransaction.discount_amount || 0);

    const handlePrint = () => {
        window.print();
    };

    const formattedDate = currentTransaction.created_at
        ? typeof currentTransaction.created_at === 'number'
            ? dayjs
                  .unix(currentTransaction.created_at)
                  .format('DD/MM/YYYY, HH:mm')
            : dayjs(currentTransaction.created_at).format('DD/MM/YYYY, HH:mm')
        : '-';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-6">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.dialog_title',
                                    'Detail Transaksi',
                                )}
                            </DialogTitle>
                            <p className="mt-1 font-mono text-sm text-muted-foreground">
                                #{currentTransaction.invoice_number}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="mr-8 gap-1.5 print:hidden"
                            disabled={loading}
                        >
                            <Printer className="h-4 w-4" />
                            {t(
                                'page.transaction.dialog_modal.detail_dialog.print_btn',
                                'Cetak Nota',
                            )}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Summary Info Cards */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.cashier_label',
                                    'Kasir / Petugas',
                                )}
                            </div>
                            {loading ? (
                                <Skeleton className="mt-1 h-5 w-24" />
                            ) : (
                                <p className="text-sm font-semibold">
                                    {currentTransaction.user_name || '-'}
                                </p>
                            )}
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <CreditCard className="h-3.5 w-3.5" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.payment_method_label',
                                    'Metode Pembayaran',
                                )}
                            </div>
                            {loading ? (
                                <Skeleton className="mt-1 h-5 w-20" />
                            ) : (
                                <p className="text-sm font-semibold">
                                    {currentTransaction.payment_method_name ||
                                        '-'}
                                </p>
                            )}
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.date_label',
                                    'Waktu Transaksi',
                                )}
                            </div>
                            {loading ? (
                                <Skeleton className="mt-1 h-5 w-28" />
                            ) : (
                                <p className="text-xs font-medium text-foreground">
                                    {formattedDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Transaction Items Table */}
                    <div>
                        <h4 className="mb-3 text-sm font-semibold">
                            {t(
                                'page.transaction.dialog_modal.detail_dialog.items_title',
                                'Rincian Produk',
                            )}
                        </h4>
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[35%]">
                                            Produk
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Satuan
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Jumlah
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Harga
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Diskon
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 3 }).map(
                                            (_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Skeleton className="h-5 w-full" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="mx-auto h-5 w-12" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="mx-auto h-5 w-8" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="ml-auto h-5 w-16" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="ml-auto h-5 w-16" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="ml-auto h-5 w-20" />
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    ) : currentTransaction.details &&
                                      currentTransaction.details.length > 0 ? (
                                        currentTransaction.details.map(
                                            (item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.product_name ||
                                                            `Produk #${item.product_id}`}
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs text-muted-foreground">
                                                        {item.unit_name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">
                                                        {formatRupiah(
                                                            item.price,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">
                                                        {item.discount &&
                                                        Number(item.discount) >
                                                            0 ? (
                                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                -
                                                                {formatRupiah(
                                                                    Number(
                                                                        item.discount,
                                                                    ),
                                                                )}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatRupiah(
                                                            item.subtotal ??
                                                                (Number(
                                                                    item.price,
                                                                ) -
                                                                    Number(
                                                                        item.discount ||
                                                                            0,
                                                                    )) *
                                                                    item.quantity,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-20 text-center text-muted-foreground"
                                            >
                                                Detail produk tidak tersedia.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Financial Summary Breakdown */}
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                        {discountAmount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal Sebelum Diskon
                                </span>
                                {loading ? (
                                    <Skeleton className="h-5 w-20" />
                                ) : (
                                    <span className="font-medium">
                                        {formatRupiah(
                                            Number(
                                                currentTransaction.total_amount,
                                            ) + discountAmount,
                                        )}
                                    </span>
                                )}
                            </div>
                        )}
                        {discountAmount > 0 && (
                            <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                <span className="font-medium">
                                    Diskon Transaksi
                                </span>
                                {loading ? (
                                    <Skeleton className="h-5 w-20" />
                                ) : (
                                    <span className="font-bold">
                                        - {formatRupiah(discountAmount)}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-muted-foreground">
                                Total Transaksi
                            </span>
                            {loading ? (
                                <Skeleton className="h-6 w-24" />
                            ) : (
                                <span className="text-lg font-bold text-primary">
                                    {formatRupiah(
                                        currentTransaction.total_amount,
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Nominal Pembayaran
                            </span>
                            {loading ? (
                                <Skeleton className="h-5 w-20" />
                            ) : (
                                <span className="font-medium">
                                    {formatRupiah(
                                        currentTransaction.payment_amount,
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between border-t pt-2 text-sm">
                            <span className="text-muted-foreground">
                                Kembalian
                            </span>
                            {loading ? (
                                <Skeleton className="h-5 w-20" />
                            ) : (
                                <span className="font-semibold">
                                    {formatRupiah(
                                        currentTransaction.change_amount,
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
