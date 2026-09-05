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

function ReceiptDivider({ className = '' }: { className?: string }) {
    return (
        <div
            className={`my-1 overflow-hidden select-none print:my-0.5 ${className}`}
            aria-hidden="true"
        >
            <svg
                className="h-[1px] w-full text-zinc-400 dark:text-zinc-600 print:text-black"
                preserveAspectRatio="none"
            >
                <line
                    x1="0"
                    y1="0.5"
                    x2="100%"
                    y2="0.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="6 3"
                />
            </svg>
        </div>
    );
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
        ? typeof transaction.created_at === 'number'
            ? dayjs.unix(transaction.created_at).format('DD/MM/YYYY HH:mm')
            : dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm')
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
            className="mx-auto w-full max-w-[260px] space-y-3 rounded-xl border bg-card p-4 font-sans text-[11px] leading-relaxed shadow-xs print:m-0 print:mr-auto print:ml-0 print:w-full print:max-w-[46mm] print:space-y-2 print:rounded-none print:border-none print:bg-transparent print:p-0 print:pr-1 print:text-[10px] print:leading-tight print:shadow-none"
        >
            {/* Store Header */}
            <div className="space-y-1 text-center">
                <h3 className="text-xs font-extrabold tracking-tight break-words text-foreground uppercase print:text-[11px] print:text-black">
                    {storeName ||
                        t(
                            'page.settings.store.receipt_preview.mock_name',
                            'NAMA TOKO',
                        )}
                </h3>
                <p className="text-[9px] leading-normal break-words whitespace-pre-line text-muted-foreground/80 print:text-[9px] print:text-black">
                    {storeAddress ||
                        t(
                            'page.settings.store.receipt_preview.mock_address',
                            'Alamat Toko',
                        )}
                </p>
                <div className="mt-1 text-[9px] font-bold tracking-wide text-foreground tabular-nums print:text-[9px] print:text-black">
                    {invoiceNumber}
                </div>
            </div>

            <ReceiptDivider />

            {/* Transaction Details */}
            <div className="space-y-1 text-[11px] text-muted-foreground print:space-y-0.5 print:text-[9.5px] print:text-black">
                <div className="flex items-center justify-between">
                    <span>{t('page.kasir.receipt_date', 'Tanggal')}</span>
                    <span className="font-medium text-foreground tabular-nums print:text-black">
                        {createdAt}
                    </span>
                </div>
                {transaction.user_name && (
                    <div className="flex items-center justify-between">
                        <span>{t('page.kasir.receipt_cashier', 'Kasir')}</span>
                        <span className="font-medium text-foreground print:text-black">
                            {transaction.user_name}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span>
                        {t(
                            'page.kasir.receipt_payment_method',
                            'Metode Pembayaran',
                        )}
                    </span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold text-foreground uppercase print:bg-transparent print:p-0 print:text-[9.5px] print:text-black">
                        {paymentMethodName}
                    </span>
                </div>
            </div>

            <ReceiptDivider />

            {/* Table Column Headers */}
            <div className="flex justify-between text-[9px] font-bold tracking-wider text-muted-foreground uppercase print:text-[9px] print:text-black">
                <span className="text-left">
                    {t('page.kasir.receipt_item_name', 'Barang / Qty x Harga')}
                </span>
                <span className="text-right">
                    {t('page.kasir.receipt_total', 'Total')}
                </span>
            </div>

            <ReceiptDivider />

            {/* Items List */}
            <div className="scrollbar-thin max-h-[35vh] space-y-2.5 overflow-y-auto py-0.5 pr-1.5 print:max-h-none print:space-y-1.5 print:overflow-visible print:p-0">
                {details.map((detail: any, index: number) => {
                    const disc = Number(detail.discount) || 0;
                    const unitPrice = Number(detail.price) || 0;
                    const netUnitPrice = unitPrice - disc;
                    const netSubtotal = netUnitPrice * detail.quantity;

                    return (
                        <div
                            key={detail.id || index}
                            className="space-y-0.5 text-[11px] print:text-[10px]"
                        >
                            {/* Line 1: Product Name */}
                            <div className="leading-snug font-semibold break-words text-foreground print:text-black">
                                {detail.product_name ||
                                    `Barang #${detail.product_id}`}
                            </div>

                            {/* Line 2 (If Discount): Original Price coret & Info Diskon */}
                            {disc > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground print:text-[9px] print:text-black">
                                    <span
                                        className="line-through decoration-black decoration-1"
                                        style={{
                                            textDecoration: 'line-through',
                                        }}
                                    >
                                        Rp {formatPrice(unitPrice)}
                                    </span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400 print:text-black">
                                        (
                                        {t(
                                            'page.kasir.receipt_item_discount',
                                            'Diskon -{{disc}}',
                                            { disc: formatPrice(disc) },
                                        )}
                                        )
                                    </span>
                                </div>
                            )}

                            {/* Line 3: Qty x Price = Subtotal */}
                            <div className="flex items-center justify-between text-muted-foreground print:text-black">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-foreground tabular-nums print:text-black">
                                        {detail.quantity}
                                    </span>
                                    <span>x</span>
                                    <span className="tabular-nums">
                                        {formatPrice(netUnitPrice)}
                                    </span>
                                </div>
                                <span className="font-bold text-foreground tabular-nums print:text-black">
                                    {formatPrice(netSubtotal)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ReceiptDivider />

            {/* Totals Summary */}
            <div className="space-y-1.5 pt-0.5 text-[11px] print:space-y-1 print:pt-0 print:text-[10px]">
                {hasTransactionDiscount ? (
                    <>
                        <div className="flex items-center justify-between text-muted-foreground print:text-black">
                            <span>
                                {t('page.kasir.receipt_subtotal', 'Subtotal')}
                            </span>
                            <span className="font-semibold text-foreground tabular-nums print:text-black">
                                {formatPrice(netItemsSubtotal)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
                            <span>
                                {t(
                                    'page.kasir.receipt_transaction_discount',
                                    'Diskon Transaksi',
                                )}
                            </span>
                            <span className="font-semibold tabular-nums print:text-black">
                                -{formatPrice(discountAmount)}
                            </span>
                        </div>

                        <ReceiptDivider />

                        <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground print:text-black">
                                {t('page.kasir.receipt_total', 'TOTAL')}
                            </span>
                            <span className="text-xs font-extrabold text-foreground tabular-nums print:text-[11px] print:text-black">
                                {formatPrice(totalAmount)}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground print:text-black">
                            {t('page.kasir.receipt_total', 'TOTAL')}
                        </span>
                        <span className="text-xs font-extrabold text-foreground tabular-nums print:text-[11px] print:text-black">
                            {formatPrice(totalAmount)}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground print:text-black">
                    <span>{t('page.kasir.receipt_pay', 'Bayar')}</span>
                    <span className="font-semibold text-foreground tabular-nums print:text-black">
                        {formatPrice(paymentAmount)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground print:text-black">
                        {t('page.kasir.receipt_change', 'Kembalian')}
                    </span>
                    <span className="text-xs font-extrabold text-foreground tabular-nums print:text-[11px] print:text-black">
                        {formatPrice(changeAmount)}
                    </span>
                </div>

                {totalSavings > 0 && (
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 print:border-none print:bg-transparent print:p-0 print:text-black">
                        <span>
                            {t(
                                'page.kasir.receipt_total_savings',
                                'TOTAL HEMAT',
                            )}
                        </span>
                        <span className="tabular-nums">
                            {formatPrice(totalSavings)}
                        </span>
                    </div>
                )}
            </div>

            <ReceiptDivider />

            {/* Receipt Footer */}
            <div className="space-y-1.5 text-center text-zinc-500 dark:text-zinc-400 print:space-y-1 print:text-black">
                {(storePhone || storeEmail) && (
                    <p className="text-[9.5px] leading-normal break-words text-muted-foreground/80 print:text-[9px] print:text-black">
                        {storePhone &&
                            `${t('page.kasir.receipt_phone_label', 'Telp')}: ${storePhone}`}
                        {storePhone && storeEmail && ' | '}
                        {storeEmail && `Email: ${storeEmail}`}
                    </p>
                )}
                {storeReceiptFooter && (
                    <p className="text-[9.5px] leading-normal break-words whitespace-pre-wrap print:text-[9px] print:text-black">
                        {storeReceiptFooter}
                    </p>
                )}
                {storeReceiptFooter && <ReceiptDivider />}
                <div className="pt-0.5 text-center">
                    <p className="text-[9.5px] font-bold tracking-wider break-words text-muted-foreground/80 uppercase print:text-[9px] print:text-black">
                        {t(
                            'page.kasir.receipt_thank_you',
                            'TERIMA KASIH. SELAMAT BELANJA KEMBALI',
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
