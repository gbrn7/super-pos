import dayjs from 'dayjs';
import { CreditCard, Calendar, User, Printer, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReceiptCard from '@/components/receipt-card';
import type { StoreSetting } from '@/components/receipt-modal';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axiosInstance from '@/lib/axios';
import { formatRupiah } from '@/lib/format-money';
import { handleApiError } from '@/lib/utils';
import { show as apiShowTransaction } from '@/routes/apiTransactions';
import type { ResponseApi } from '@/support/interfaces/response/Response';
import type { Transaction } from '@/support/models/transaction';

interface DetailDialogProps {
    isOpen: boolean;
    transaction: Transaction | null;
    onOpenChange: (open: boolean) => void;
    storeSetting?: StoreSetting | null;
}

export function DetailDialog({
    isOpen,
    transaction,
    onOpenChange,
    storeSetting,
}: DetailDialogProps) {
    const { t } = useTranslation();
    const [detailData, setDetailData] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [prevTransactionId, setPrevTransactionId] = useState<number | null>(
        null,
    );

    const finalStoreSetting = storeSetting || {
        name: 'Toko Maju Jaya',
        address: 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
        phone: '081234567890',
        email: 'contact@majujaya.com',
        receipt_footer: null,
    };

    if (isOpen && transaction?.id && transaction.id !== prevTransactionId) {
        setPrevTransactionId(transaction.id);
        setLoading(true);
        setDetailData(null);
    }

    if (!isOpen && prevTransactionId !== null) {
        setPrevTransactionId(null);
        setLoading(false);
        setDetailData(null);
    }

    useEffect(() => {
        if (isOpen && transaction?.id) {
            let isMounted = true;
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
        }
    }, [isOpen, transaction?.id]);

    if (!transaction) {
        return null;
    }

    const currentTransaction = detailData || transaction;
    const discountAmount = Number(currentTransaction.discount_amount || 0);
    const details = currentTransaction.details ?? [];
    const totalItemDiscount = details.reduce(
        (sum, item) => sum + (Number(item.discount) || 0) * item.quantity,
        0,
    );
    const grossSubtotal = details.length > 0
        ? details.reduce(
              (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
              0,
          )
        : Number(currentTransaction.total_amount) + discountAmount + totalItemDiscount;

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
            <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-4xl">
                <div className="space-y-6 print:hidden">
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

                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.tab_details',
                                    'Rincian Transaksi',
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="receipt">
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.tab_receipt',
                                    'Struk / Nota',
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="details"
                            className="space-y-6 border-none p-0 pt-4 outline-none"
                        >
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
                                            {currentTransaction.user_name ||
                                                '-'}
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
                                            {currentTransaction.payment_method_name
                                                ? t(
                                                      `payment_method_name.${currentTransaction.payment_method_name}`,
                                                      currentTransaction.payment_method_name,
                                                  )
                                                : '-'}
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
                                <div className="max-h-[320px] overflow-y-auto rounded-md border">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-muted">
                                            <TableRow>
                                                <TableHead className="w-[30%]">
                                                    {t('page.transaction.dialog_modal.detail_dialog.product_header', 'Produk')}
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    {t('page.transaction.dialog_modal.detail_dialog.unit_header', 'Satuan')}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.cost_price_header', 'Harga Modal')}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.price_header', 'Harga Jual')}
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    {t('page.transaction.dialog_modal.detail_dialog.qty_header', 'Jumlah')}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.subtotal_header', 'Subtotal')}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.discount_header', 'Diskon / Satuan')}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t('page.transaction.dialog_modal.detail_dialog.margin_header', 'Margin')}
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
                                                                <Skeleton className="ml-auto h-5 w-16" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-16" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="mx-auto h-5 w-8" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-20" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-16" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="ml-auto h-5 w-16" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : currentTransaction.details &&
                                              currentTransaction.details
                                                  .length > 0 ? (
                                                currentTransaction.details.map(
                                                    (item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">
                                                                {item.product_name || t('page.transaction.dialog_modal.detail_dialog.default_product_name', 'Produk #{{id}}', { id: item.product_id })}
                                                            </TableCell>
                                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                                {item.unit_name ||
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs">
                                                                {formatRupiah(
                                                                    item.cost_price,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs">
                                                                {formatRupiah(
                                                                    item.price,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center font-semibold">
                                                                {item.quantity}
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
                                                            <TableCell className="text-right text-xs">
                                                                {item.discount &&
                                                                Number(
                                                                    item.discount,
                                                                ) > 0 ? (
                                                                    <span className="font-semibold">
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
                                                            <TableCell className="text-right text-xs font-semibold">
                                                                {(() => {
                                                                    const margin = Number(item.price) - Number(item.discount || 0) - Number(item.cost_price);
                                                                    if (margin > 0) return <span className="text-emerald-600 dark:text-emerald-400">+{formatRupiah(margin)}</span>;
                                                                    if (margin < 0) return <span className="text-rose-600 dark:text-rose-400">{formatRupiah(margin)}</span>;
                                                                    return <span className="text-muted-foreground">Rp 0</span>;
                                                                })()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={8}
                                                        className="h-20 text-center text-muted-foreground"
                                                    >
                                                        {t('page.transaction.dialog_modal.detail_dialog.empty_items', 'Detail produk tidak tersedia.')}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Financial Summary Breakdown */}
                            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('page.transaction.dialog_modal.detail_dialog.subtotal_header', 'Subtotal')}
                                    </span>
                                    {loading ? (
                                        <Skeleton className="h-5 w-20" />
                                    ) : (
                                        <span className="font-medium">
                                            {formatRupiah(grossSubtotal)}
                                        </span>
                                    )}
                                </div>
                                {totalItemDiscount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            {t('page.transaction.dialog_modal.detail_dialog.product_discount', 'Diskon Produk')}
                                        </span>
                                        {loading ? (
                                            <Skeleton className="h-5 w-20" />
                                        ) : (
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                - {formatRupiah(totalItemDiscount)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            {t('page.transaction.dialog_modal.detail_dialog.transaction_discount', 'Diskon Transaksi')}
                                        </span>
                                        {loading ? (
                                            <Skeleton className="h-5 w-20" />
                                        ) : (
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                - {formatRupiah(discountAmount)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t pt-2 text-sm">
                                    <span className="font-medium text-muted-foreground">
                                        {t('page.transaction.dialog_modal.detail_dialog.total_transaction', 'Total Transaksi')}
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
                                        {t('page.transaction.dialog_modal.detail_dialog.payment_amount', 'Nominal Pembayaran')}
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
                                        {t('page.transaction.dialog_modal.detail_dialog.change_amount', 'Kembalian')}
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
                        </TabsContent>
                        <TabsContent
                            value="receipt"
                            className="border-none p-0 pt-4 outline-none"
                        >
                            <div className="flex justify-center rounded-lg bg-muted/20 py-4">
                                <ReceiptCard
                                    storeName={finalStoreSetting.name}
                                    storeAddress={finalStoreSetting.address}
                                    storePhone={finalStoreSetting.phone}
                                    storeEmail={finalStoreSetting.email}
                                    storeReceiptFooter={
                                        finalStoreSetting.receipt_footer
                                    }
                                    transaction={currentTransaction}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="hidden print:block">
                    <ReceiptCard
                        storeName={finalStoreSetting.name}
                        storeAddress={finalStoreSetting.address}
                        storePhone={finalStoreSetting.phone}
                        storeEmail={finalStoreSetting.email}
                        storeReceiptFooter={finalStoreSetting.receipt_footer}
                        transaction={currentTransaction}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
