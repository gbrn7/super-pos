import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/lib/format-money';
import type { Transaction } from '@/support/models/transaction';

export interface ReceiptCardProps {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail?: string | null;
    storeReceiptFooter?: string | null;
    transaction: Transaction;
}

export default function ReceiptCard({
    storeName,
    storeAddress,
    storePhone,
    storeEmail,
    storeReceiptFooter,
    transaction,
}: ReceiptCardProps) {
    const { t } = useTranslation();

    // Format price helper (removes Rp prefix and trims spaces)
    const formatPrice = (val: number) => {
        return formatRupiah(val).replace('Rp', '').trim();
    };

    const details = transaction.details ?? [];
    const invoiceNumber = transaction.invoice_number ?? '';
    const paymentMethodName = transaction.payment_method_name ?? 'Cash';

    const createdAt = transaction.created_at
        ? (typeof transaction.created_at === 'number'
            ? dayjs.unix(transaction.created_at).format('DD/MM/YYYY HH:mm')
            : dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm'))
        : dayjs().format('DD/MM/YYYY HH:mm');

    const discountAmount = Number(transaction.discount_amount ?? 0);
    const totalItemDiscount = details.reduce(
        (acc, detail) => acc + (Number(detail.discount) || 0) * detail.quantity,
        0,
    );

    const grossSubtotal = details.reduce(
        (acc, detail) => acc + (Number(detail.price) || 0) * detail.quantity,
        0,
    );

    const netItemsSubtotal = grossSubtotal - totalItemDiscount;
    const totalSavings = totalItemDiscount + discountAmount;
    const hasTransactionDiscount = discountAmount > 0;

    const totalAmount = Number(transaction.total_amount ?? 0);
    const paymentAmount = Number(transaction.payment_amount ?? 0);
    const changeAmount = Number(transaction.change_amount ?? 0);

    return (
        <div
            id="printable-receipt"
            className="w-full max-w-[260px] mx-auto space-y-4 rounded-xl border bg-card p-4 font-sans text-[11px] leading-relaxed shadow-xs"
        >
            {/* Store Header */}
            <div className="space-y-1 text-center">
                <h3 className="text-xs font-extrabold tracking-tight text-foreground uppercase truncate">
                    {storeName || t('page.settings.store.receipt_preview.mock_name', 'NAMA TOKO')}
                </h3>
                <p className="text-[9px] leading-normal text-muted-foreground/80 whitespace-pre-line">
                    {storeAddress || t('page.settings.store.receipt_preview.mock_address', 'Alamat Toko')}
                </p>
                <div className="text-[9px] font-bold text-foreground tabular-nums tracking-wide mt-1">
                    {invoiceNumber}
                </div>
            </div>

            <div className="my-1 border-t border-border/50 select-none" />

            {/* Transaction Details */}
            <div className="space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between">
                    <span>
                        {t('page.kasir.receipt_date', 'Tanggal')}
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                        {createdAt}
                    </span>
                </div>
                {transaction.user_name && (
                    <div className="flex items-center justify-between">
                        <span>
                            {t('page.kasir.receipt_cashier', 'Kasir')}
                        </span>
                        <span className="font-medium text-foreground">
                            {transaction.user_name}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span>
                        {t('page.kasir.receipt_payment_method', 'Metode Pembayaran')}
                    </span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold text-foreground uppercase">
                        {paymentMethodName}
                    </span>
                </div>
            </div>

            <div className="my-1 border-t border-border/50 select-none" />

            {/* Table Column Headers */}
            <div className="flex justify-between text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                <span className="text-left">
                    {t('page.kasir.receipt_item_name', 'Barang / Qty x Harga')}
                </span>
                <span className="text-right">
                    {t('page.kasir.receipt_total', 'Total')}
                </span>
            </div>

            <div className="my-1 border-t border-dashed border-border/50 select-none" />

            {/* Items List */}
            <div className="scrollbar-thin max-h-[35vh] space-y-2.5 overflow-y-auto py-0.5 pr-1.5 print:max-h-none print:overflow-visible print:pr-0">
                {details.map((detail: any, index: number) => {
                    const disc = Number(detail.discount) || 0;
                    const unitPrice = Number(detail.price) || 0;
                    const netUnitPrice = unitPrice - disc;
                    const netSubtotal = netUnitPrice * detail.quantity;

                    return (
                        <div key={detail.id || index} className="space-y-0.5 text-[11px]">
                            {/* Line 1: Product Name */}
                            <div className="font-semibold leading-snug break-words text-foreground">
                                {detail.product_name || `Barang #${detail.product_id}`}
                            </div>

                            {/* Line 2 (If Discount): Original Price coret & Info Diskon */}
                            {disc > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <span className="line-through decoration-black decoration-1" style={{ textDecoration: 'line-through' }}>
                                        Rp {formatPrice(unitPrice)}
                                    </span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        ({t('page.kasir.receipt_item_discount', 'Diskon -{{disc}}', { disc: formatPrice(disc) })})
                                    </span>
                                </div>
                            )}

                            {/* Line 3: Qty x Price = Subtotal */}
                            <div className="flex items-center justify-between text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <span className="tabular-nums font-medium text-foreground">
                                        {detail.quantity}
                                    </span>
                                    <span>x</span>
                                    <span className="tabular-nums">
                                        {formatPrice(netUnitPrice)}
                                    </span>
                                </div>
                                <span className="font-bold text-foreground tabular-nums">
                                    {formatPrice(netSubtotal)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="my-1 border-t border-dashed border-border/50 select-none" />

            {/* Totals Summary */}
            <div className="space-y-2 border-t border-border/50 pt-3 text-[11px]">
                {hasTransactionDiscount ? (
                    <>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>
                                {t('page.kasir.receipt_subtotal', 'Subtotal')}
                            </span>
                            <span className="font-semibold text-foreground tabular-nums">
                                {formatPrice(netItemsSubtotal)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                            <span>
                                {t('page.kasir.receipt_transaction_discount', 'Diskon Transaksi')}
                            </span>
                            <span className="font-semibold tabular-nums">
                                -{formatPrice(discountAmount)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/20 pt-1">
                            <span className="font-bold text-foreground">
                                {t('page.kasir.receipt_total', 'TOTAL')}
                            </span>
                            <span className="text-xs font-extrabold text-foreground tabular-nums">
                                {formatPrice(totalAmount)}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                            {t('page.kasir.receipt_total', 'TOTAL')}
                        </span>
                        <span className="text-xs font-extrabold text-foreground tabular-nums">
                            {formatPrice(totalAmount)}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('page.kasir.receipt_pay', 'Bayar')}</span>
                    <span className="font-semibold text-foreground tabular-nums">
                        {formatPrice(paymentAmount)}
                    </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/20 pt-1">
                    <span className="font-bold text-foreground">
                        {t('page.kasir.receipt_change', 'Kembalian')}
                    </span>
                    <span className="text-xs font-extrabold text-foreground tabular-nums">
                        {formatPrice(changeAmount)}
                    </span>
                </div>

                {totalSavings > 0 && (
                    <div className="mt-1.5 flex items-center justify-between rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <span>
                            {t('page.kasir.receipt_total_savings', 'TOTAL HEMAT')}
                        </span>
                        <span className="tabular-nums">
                            {formatPrice(totalSavings)}
                        </span>
                    </div>
                )}
            </div>

            <div className="my-1 border-t border-border/50 select-none" />

            {/* Receipt Footer */}
            <div className="text-center space-y-2 text-zinc-500 dark:text-zinc-400">
                {(storePhone || storeEmail) && (
                    <p className="text-[10px] leading-normal text-muted-foreground/80">
                        {storePhone && `${t('page.kasir.receipt_phone_label', 'Telp')}: ${storePhone}`}
                        {storePhone && storeEmail && ' | '}
                        {storeEmail && `Email: ${storeEmail}`}
                    </p>
                )}
                {storeReceiptFooter && (
                    <p className="whitespace-pre-wrap leading-normal text-[10px]">
                        {storeReceiptFooter}
                    </p>
                )}
                <div className={`pt-1 text-center ${storeReceiptFooter ? 'border-t border-dotted border-border/20 pt-1.5' : ''}`}>
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                        {t('page.kasir.receipt_thank_you', 'TERIMA KASIH. SELAMAT BELANJA KEMBALI')}
                    </p>
                </div>
            </div>
        </div>
    );
}
