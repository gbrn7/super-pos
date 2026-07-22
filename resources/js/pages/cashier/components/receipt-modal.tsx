import dayjs from 'dayjs';
import { CheckCircle2, Printer, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatRupiah } from '@/lib/format-money';
import type { Transaction } from '@/support/models/transaction';

interface ReceiptModalProps {
    open: boolean;
    transaction: Transaction | null;
    onClose: () => void;
    onNewTransaction: () => void;
}

export default function ReceiptModal({
    open,
    transaction,
    onClose,
    onNewTransaction,
}: ReceiptModalProps) {
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
    const itemsSubtotal = details.reduce(
        (acc, detail) => acc + (Number(detail.subtotal) || 0),
        0,
    );
    const discountAmount = Number(transaction.discount_amount ?? 0);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader className="print:hidden">
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center text-lg font-extrabold">
                            {t(
                                'page.kasir.checkout_success',
                                'Transaksi Berhasil!',
                            )}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Printable Receipt Card */}
                <div
                    id="printable-receipt"
                    className="space-y-3 rounded-xl border border-dashed bg-card p-4 font-mono text-sm shadow-xs sm:p-5"
                >
                    {/* Store header */}
                    <div className="space-y-1 border-b border-dashed pb-3 text-center">
                        <p className="text-base font-black tracking-wide uppercase">
                            Super POS
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground">
                            {createdAt}
                        </p>
                        <Badge
                            variant="outline"
                            className="mt-1 px-2 font-mono text-[10px] font-bold"
                        >
                            {transaction.invoice_number}
                        </Badge>
                    </div>

                    {/* Items List */}
                    <div className="scrollbar-thin max-h-[30vh] space-y-2 overflow-y-auto py-1 pr-1.5 print:max-h-none print:overflow-visible print:pr-0">
                        {details.map((detail, index) => {
                            const disc = Number(detail.discount) || 0;
                            const unitPrice = Number(detail.price) || 0;
                            const netUnitPrice = Math.max(0, unitPrice - disc);
                            const subtotalVal =
                                Number(detail.subtotal) ||
                                netUnitPrice * detail.quantity;

                            return (
                                <div
                                    key={detail.id || index}
                                    className="space-y-0.5 border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0"
                                >
                                    <div className="flex justify-between gap-2 text-xs font-bold sm:text-sm">
                                        <span className="flex-1 truncate">
                                            {detail.product_name ||
                                                `Barang #${detail.product_id}`}
                                        </span>
                                        <span className="shrink-0 text-right">
                                            {formatRupiah(subtotalVal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>
                                            {detail.quantity} x{' '}
                                            {disc > 0 ? (
                                                <>
                                                    <span className="mr-1 font-normal text-muted-foreground/70 line-through">
                                                        {formatRupiah(
                                                            unitPrice,
                                                        )}
                                                    </span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatRupiah(
                                                            netUnitPrice,
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>
                                                    {formatRupiah(unitPrice)}
                                                </span>
                                            )}
                                            {detail.unit_name
                                                ? ` (${detail.unit_name})`
                                                : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Totals Summary */}
                    <div className="space-y-1.5 border-t border-dashed pt-3 text-xs sm:text-sm">
                        <div className="flex justify-between font-semibold text-muted-foreground">
                            <span>
                                {t(
                                    'page.kasir.items_subtotal',
                                    'Subtotal Barang',
                                )}
                            </span>
                            <span className="font-bold text-foreground">
                                {formatRupiah(itemsSubtotal)}
                            </span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                <span>
                                    {t(
                                        'page.kasir.total_discount_label',
                                        'Potongan / Diskon',
                                    )}
                                </span>
                                <span>- {formatRupiah(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between border-t pt-1 text-sm font-black text-foreground sm:text-base">
                            <span>
                                {t(
                                    'page.kasir.grand_total_label',
                                    'Grand Total',
                                )}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(Number(transaction.total_amount))}
                            </span>
                        </div>

                        <div className="flex justify-between pt-0.5 font-semibold text-muted-foreground">
                            <span>
                                {t(
                                    'page.kasir.payment_amount_label',
                                    'Nominal Diterima',
                                )}
                            </span>
                            <span className="font-bold text-foreground">
                                {formatRupiah(
                                    Number(transaction.payment_amount),
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between font-bold text-primary">
                            <span>
                                {t('page.kasir.change_label', 'Kembalian:')}
                            </span>
                            <span className="font-black">
                                {formatRupiah(
                                    Number(transaction.change_amount),
                                )}
                            </span>
                        </div>

                        {transaction.payment_method_name && (
                            <div className="flex justify-between border-t border-border/50 pt-1 text-xs text-muted-foreground">
                                <span>
                                    {t(
                                        'page.kasir.payment_method_label',
                                        'Metode Pembayaran',
                                    )}
                                </span>
                                <span className="font-bold text-foreground">
                                    {transaction.payment_method_name}
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="border-t border-dashed pt-3 text-center text-[11px] font-semibold text-muted-foreground">
                        {t(
                            'page.kasir.receipt_thank_you',
                            'Terima kasih atas kunjungan Anda!',
                        )}
                    </p>
                </div>

                <DialogFooter className="flex-row gap-2 sm:flex-row print:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 gap-1.5 font-bold"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" />
                        {t('page.kasir.print_btn', 'Print')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="h-10 flex-1 gap-1.5 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
                        onClick={onNewTransaction}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {t('page.kasir.new_transaction', 'Transaksi Baru')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
