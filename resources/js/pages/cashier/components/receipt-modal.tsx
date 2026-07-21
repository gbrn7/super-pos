import { Transaction } from '@/support/models/transaction';
import { formatRupiah } from '@/lib/format-money';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Printer, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface ReceiptModalProps {
    open: boolean;
    transaction: Transaction | null;
    onClose: () => void;
    onNewTransaction: () => void;
}

export default function ReceiptModal({ open, transaction, onClose, onNewTransaction }: ReceiptModalProps) {
    const { t } = useTranslation();

    if (!transaction) {
        return null;
    }

    const createdAt = transaction.created_at
        ? typeof transaction.created_at === 'number'
            ? dayjs.unix(transaction.created_at).format('DD/MM/YYYY HH:mm')
            : dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm')
        : dayjs().format('DD/MM/YYYY HH:mm');

    const details = transaction.details ?? [];
    const totalItemDiscounts = details.reduce((acc, detail) => acc + (Number(detail.discount) || 0) * detail.quantity, 0);
    const itemsSubtotal = details.reduce((acc, detail) => acc + (Number(detail.subtotal) || 0), 0);
    const grossTotal = details.reduce((acc, detail) => acc + (Number(detail.price) || 0) * detail.quantity, 0);
    const discountAmount = Number(transaction.discount_amount ?? 0);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader className="print:hidden">
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center text-lg font-extrabold">
                            {t('page.kasir.checkout_success', 'Transaksi Berhasil!')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Printable Receipt Card */}
                <div className="bg-card rounded-xl p-4 sm:p-5 space-y-3 font-mono text-sm border border-dashed shadow-xs">
                    {/* Store header */}
                    <div className="text-center border-b border-dashed pb-3 space-y-1">
                        <p className="font-black text-base tracking-wide uppercase">Super POS</p>
                        <p className="text-xs text-muted-foreground font-semibold">{createdAt}</p>
                        <Badge variant="outline" className="text-[10px] font-mono font-bold mt-1 px-2">
                            {transaction.invoice_number}
                        </Badge>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 py-1">
                        {details.map((detail, index) => {
                            const disc = Number(detail.discount) || 0;
                            const unitPrice = Number(detail.price) || 0;
                            const netUnitPrice = Math.max(0, unitPrice - disc);
                            const subtotalVal = Number(detail.subtotal) || netUnitPrice * detail.quantity;

                            return (
                                <div key={detail.id || index} className="space-y-0.5 border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between gap-2 font-bold text-xs sm:text-sm">
                                        <span className="truncate flex-1">{detail.product_name || `Barang #${detail.product_id}`}</span>
                                        <span className="text-right shrink-0">{formatRupiah(subtotalVal)}</span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground flex justify-between">
                                        <span>
                                            {detail.quantity} x{' '}
                                            {disc > 0 ? (
                                                <>
                                                    <span className="line-through text-muted-foreground/70 mr-1 font-normal">
                                                        {formatRupiah(unitPrice)}
                                                    </span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                        {formatRupiah(netUnitPrice)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>{formatRupiah(unitPrice)}</span>
                                            )}
                                            {detail.unit_name ? ` (${detail.unit_name})` : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Totals Summary */}
                    <div className="border-t border-dashed pt-3 space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between text-muted-foreground font-semibold">
                            <span>{t('page.kasir.items_subtotal', 'Subtotal Barang')}</span>
                            <span className="font-bold text-foreground">{formatRupiah(itemsSubtotal)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                                <span>{t('page.kasir.total_discount_label', 'Potongan / Diskon')}</span>
                                <span>- {formatRupiah(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-black text-sm sm:text-base pt-1 border-t text-foreground">
                            <span>{t('page.kasir.grand_total_label', 'Grand Total')}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(Number(transaction.total_amount))}</span>
                        </div>

                        <div className="flex justify-between text-muted-foreground font-semibold pt-0.5">
                            <span>{t('page.kasir.payment_amount_label', 'Nominal Diterima')}</span>
                            <span className="font-bold text-foreground">{formatRupiah(Number(transaction.payment_amount))}</span>
                        </div>

                        <div className="flex justify-between font-bold text-primary">
                            <span>{t('page.kasir.change_label', 'Kembalian:')}</span>
                            <span className="font-black">{formatRupiah(Number(transaction.change_amount))}</span>
                        </div>

                        {transaction.payment_method_name && (
                            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                                <span>{t('page.kasir.payment_method_label', 'Metode Pembayaran')}</span>
                                <span className="font-bold text-foreground">{transaction.payment_method_name}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-[11px] text-muted-foreground border-t border-dashed pt-3 font-semibold">
                        {t('page.kasir.receipt_thank_you', 'Terima kasih atas kunjungan Anda!')}
                    </p>
                </div>

                <DialogFooter className="flex-row gap-2 sm:flex-row print:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 font-bold h-10"
                        onClick={() => window.print()}
                    >
                        <Printer className="w-4 h-4" />
                        {t('page.kasir.print_btn', 'Print')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="flex-1 gap-1.5 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white h-10"
                        onClick={onNewTransaction}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {t('page.kasir.new_transaction', 'Transaksi Baru')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
