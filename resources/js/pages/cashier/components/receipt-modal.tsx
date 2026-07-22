import dayjs from 'dayjs';
import { CheckCircle2, Printer, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const discountAmount = Number(transaction.discount_amount ?? 0);
    const totalItemDiscount = details.reduce(
        (acc, detail) => acc + (Number(detail.discount) || 0) * detail.quantity,
        0,
    );
    const totalSavings = totalItemDiscount + discountAmount;

    // Helper to format currency without Rp prefix and trim spaces
    const formatPrice = (val: number) => {
        return formatRupiah(val).replace('Rp', '').trim();
    };

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
                    className="space-y-2 rounded-xl border border-dashed bg-card p-4 font-mono text-[11px] shadow-xs sm:p-5 sm:text-xs"
                >
                    {/* Store header */}
                    <div className="space-y-0.5 text-center leading-tight">
                        <p className="text-sm font-black tracking-wide text-foreground uppercase">
                            Toko Maju Jaya
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Jl. Raya Bekasi KM.18 RT.004/0009,
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Jakarta Timur, 13250
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Telp: 081234567890
                        </p>
                    </div>

                    <div className="text-center leading-none text-muted-foreground/60 select-none">
                        ================================
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-0.5 leading-tight text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Kode Transaksi:</span>
                            <span className="font-bold text-foreground">
                                {transaction.invoice_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pembayaran:</span>
                            <span className="font-bold text-foreground">
                                {transaction.payment_method_name || 'Cash'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal:</span>
                            <span className="font-bold text-foreground">
                                {createdAt}
                            </span>
                        </div>
                    </div>

                    <div className="text-center leading-none text-muted-foreground/60 select-none">
                        ================================
                    </div>

                    {/* Table Column Headers */}
                    <div className="flex justify-between font-bold text-muted-foreground">
                        <span className="flex-1 text-left">Nama Barang</span>
                        <span className="w-8 text-right">Qty</span>
                        <span className="w-16 text-right">Harga</span>
                        <span className="w-20 text-right">Total</span>
                    </div>

                    <div className="text-center leading-none text-muted-foreground/60 select-none">
                        --------------------------------
                    </div>

                    {/* Items List */}
                    <div className="scrollbar-thin max-h-[30vh] space-y-2 overflow-y-auto py-0.5 pr-1.5 print:max-h-none print:overflow-visible print:pr-0">
                        {details.map((detail, index) => {
                            const disc = Number(detail.discount) || 0;
                            const unitPrice = Number(detail.price) || 0;
                            const originalSubtotal =
                                unitPrice * detail.quantity;

                            return (
                                <div
                                    key={detail.id || index}
                                    className="space-y-0.5"
                                >
                                    <div className="flex justify-between gap-1 leading-tight">
                                        <span className="flex-1 truncate font-bold text-foreground">
                                            {detail.product_name ||
                                                `Barang #${detail.product_id}`}
                                        </span>
                                        <span className="w-8 text-right text-foreground">
                                            {detail.quantity}
                                        </span>
                                        <span className="w-16 text-right text-foreground">
                                            {formatPrice(unitPrice)}
                                        </span>
                                        <span className="w-20 text-right font-bold text-foreground">
                                            {formatPrice(originalSubtotal)}
                                        </span>
                                    </div>
                                    {disc > 0 && (
                                        <div className="flex justify-between text-[10px] leading-tight font-bold text-emerald-600 dark:text-emerald-400">
                                            <span className="flex-1"></span>
                                            <span className="w-16 text-right">
                                                DISKON :
                                            </span>
                                            <span className="w-20 text-right">
                                                (
                                                {formatPrice(
                                                    disc * detail.quantity,
                                                )}
                                                )
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center leading-none text-muted-foreground/60 select-none">
                        --------------------------------
                    </div>

                    {/* Totals Summary */}
                    <div className="space-y-1 text-xs leading-tight">
                        <div className="flex justify-between">
                            <span className="font-bold text-muted-foreground">
                                TOTAL :
                            </span>
                            <span className="font-bold text-foreground">
                                {formatPrice(Number(transaction.total_amount))}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-muted-foreground">
                                TUNAI :
                            </span>
                            <span className="font-bold text-foreground">
                                {formatPrice(
                                    Number(transaction.payment_amount),
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-muted-foreground">
                                KEMBALI :
                            </span>
                            <span className="font-extrabold text-foreground">
                                {formatPrice(Number(transaction.change_amount))}
                            </span>
                        </div>

                        {totalSavings > 0 && (
                            <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                <span>ANDA HEMAT :</span>
                                <span>{formatPrice(totalSavings)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center leading-none text-muted-foreground/60 select-none">
                        ================================
                    </div>

                    <p className="text-center text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                        {t(
                            'page.kasir.receipt_thank_you',
                            'TERIMA KASIH. SELAMAT BELANJA KEMBALI',
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
