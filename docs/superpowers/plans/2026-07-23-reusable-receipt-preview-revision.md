# Reusable Receipt Preview Revision Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `isPreview` prop from `ReceiptCard` and pass a dummy transaction object from `store.tsx` to display the settings receipt preview.

**Architecture:** Simplify `ReceiptCard` to render purely based on the `transaction` prop without mock fallbacks inside the component itself. Pass a typed mock transaction from `store.tsx`.

**Tech Stack:** React 19, TypeScript, TailwindCSS v4.

---

### Task 1: Refactor `ReceiptCard` to remove `isPreview`
**Files:**
- Modify: [receipt-card.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/components/receipt-card.tsx)

- [ ] **Step 1: Replace props and calculations in `receipt-card.tsx`**
  Modify [receipt-card.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/components/receipt-card.tsx) to remove `isPreview` logic and make `transaction` a required prop:
  ```tsx
  import dayjs from 'dayjs';
  import { useTranslation } from 'react-i18next';
  import { formatRupiah } from '@/lib/format-money';
  import type { Transaction } from '@/support/models/transaction';

  export interface ReceiptCardProps {
      storeName: string;
      storeAddress: string;
      storePhone: string;
      storeReceiptFooter?: string | null;
      transaction: Transaction;
  }

  export default function ReceiptCard({
      storeName,
      storeAddress,
      storePhone,
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
              className="w-full max-w-xs mx-auto space-y-4 rounded-xl border bg-card p-5 font-sans text-xs leading-relaxed shadow-xs"
          >
              {/* Store Header */}
              <div className="space-y-1 text-center">
                  <h3 className="text-sm font-extrabold tracking-tight text-foreground uppercase truncate">
                      {storeName || t('page.settings.store.receipt_preview.mock_name', 'NAMA TOKO')}
                  </h3>
                  <p className="text-[10px] leading-normal text-muted-foreground/80 whitespace-pre-line">
                      {storeAddress || t('page.settings.store.receipt_preview.mock_address', 'Alamat Toko')}
                      {storePhone && `\nTelp: ${storePhone}`}
                  </p>
              </div>

              <div className="my-1 border-t border-border/50 select-none" />

              {/* Transaction Details */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                      <span>
                          {t('page.kasir.receipt_transaction_code', 'Kode Transaksi')}
                      </span>
                      <span className="font-bold text-foreground tabular-nums">
                          {invoiceNumber}
                      </span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span>
                          {t('page.kasir.receipt_payment_method', 'Metode Pembayaran')}
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground uppercase">
                          {paymentMethodName}
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
                          {t('page.kasir.receipt_date', 'Tanggal')}
                      </span>
                      <span className="font-medium text-foreground tabular-nums">
                          {createdAt}
                      </span>
                  </div>
              </div>

              <div className="my-1 border-t border-border/50 select-none" />

              {/* Table Column Headers */}
              <div className="flex justify-between text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  <span className="flex-1 text-left">
                      {t('page.kasir.receipt_item_name', 'Nama Barang')}
                  </span>
                  <span className="w-8 text-right">
                      {t('page.kasir.receipt_qty', 'Qty')}
                  </span>
                  <span className="w-16 text-right">
                      {t('page.kasir.receipt_price', 'Harga')}
                  </span>
                  <span className="w-20 text-right">
                      {t('page.kasir.receipt_total', 'Total')}
                  </span>
              </div>

              <div className="my-1 border-t border-dashed border-border/50 select-none" />

              {/* Items List */}
              <div className="scrollbar-thin max-h-[35vh] space-y-3 overflow-y-auto py-0.5 pr-1.5 print:max-h-none print:overflow-visible print:pr-0">
                  {details.map((detail: any, index: number) => {
                      const disc = Number(detail.discount) || 0;
                      const unitPrice = Number(detail.price) || 0;
                      const netUnitPrice = unitPrice - disc;
                      const netSubtotal = netUnitPrice * detail.quantity;

                      return (
                          <div key={detail.id || index} className="space-y-0.5">
                              <div className="flex items-start justify-between gap-2 text-xs">
                                  <div className="min-w-0 flex-1">
                                      <span className="block leading-snug font-semibold break-words text-foreground">
                                          {detail.product_name || `Barang #${detail.product_id}`}
                                      </span>
                                      {disc > 0 && (
                                          <div className="mt-0.5 flex items-center text-[10px] text-muted-foreground">
                                              <span className="mr-1.5 line-through">
                                                  {formatPrice(unitPrice)}
                                              </span>
                                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                  {t('page.kasir.receipt_saved', 'Hemat')}{' '}
                                                  {formatPrice(disc)}/
                                                  {detail.unit_name || 'pcs'}
                                              </span>
                                          </div>
                                      )}
                                  </div>
                                  <span className="w-8 pt-0.5 text-right font-medium text-muted-foreground tabular-nums">
                                      {detail.quantity}
                                  </span>
                                  <span className="w-16 pt-0.5 text-right font-medium text-muted-foreground tabular-nums">
                                      {formatPrice(netUnitPrice)}
                                  </span>
                                  <span className="w-20 pt-0.5 text-right font-bold text-foreground tabular-nums">
                                      {formatPrice(netSubtotal)}
                                  </span>
                              </div>
                          </div>
                      );
                  })}
              </div>

              <div className="my-1 border-t border-dashed border-border/50 select-none" />

              {/* Totals Summary */}
              <div className="space-y-2 border-t border-border/50 pt-3 text-xs">
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
                              <span className="text-sm font-extrabold text-foreground tabular-nums">
                                  {formatPrice(totalAmount)}
                              </span>
                          </div>
                      </>
                  ) : (
                      <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                              {t('page.kasir.receipt_total', 'TOTAL')}
                          </span>
                          <span className="text-sm font-extrabold text-foreground tabular-nums">
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
                      <span className="text-sm font-extrabold text-foreground tabular-nums">
                          {formatPrice(changeAmount)}
                      </span>
                  </div>

                  {totalSavings > 0 && (
                      <div className="mt-1.5 flex items-center justify-between rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
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
                  <div className="pt-1 text-center">
                      <p className="text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                          {t('page.kasir.receipt_thank_you', 'TERIMA KASIH. SELAMAT BELANJA KEMBALI')}
                      </p>
                  </div>
                  {storeReceiptFooter && (
                      <p className="whitespace-pre-wrap border-t border-dotted border-border/20 pt-1.5 leading-normal text-[10px]">
                          {storeReceiptFooter}
                      </p>
                  )}
              </div>
          </div>
      );
  }
  ```
- [ ] **Step 2: Commit**
  Run: `git add resources/js/components/receipt-card.tsx && git commit -m "refactor: simplify ReceiptCard by removing isPreview prop"`

---

### Task 2: Pass Dummy Transaction from `store.tsx`
**Files:**
- Modify: [store.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/settings/store.tsx)

- [ ] **Step 1: Add dummyTransaction and pass it to `<ReceiptCard>` in `store.tsx`**
  Modify [store.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/settings/store.tsx):
  ```tsx
  // Define dummyTransaction inside Store component
  const dummyTransaction = {
      id: 1,
      invoice_number: 'INV/20260723/0001',
      payment_method_name: 'Cash',
      user_name: t('page.settings.store.receipt_preview.mock_cashier', 'Admin'),
      created_at: '2026-07-23T08:42:00.000000Z',
      total_amount: 48000,
      discount_amount: 0,
      payment_amount: 50000,
      change_amount: 2000,
      details: [
          {
              id: 1,
              product_name: t('page.settings.store.receipt_preview.mock_item_1', 'Kopi Susu Gula Aren'),
              product_id: 1,
              price: 18000,
              quantity: 1,
              discount: 0,
              unit_name: 'pcs',
          },
          {
              id: 2,
              product_name: t('page.settings.store.receipt_preview.mock_item_2', 'Roti Bakar Cokelat'),
              product_id: 2,
              price: 15000,
              quantity: 2,
              discount: 0,
              unit_name: 'pcs',
          },
      ],
  } as any;
  ```
  Pass it to `<ReceiptCard>`:
  ```tsx
  <ReceiptCard
      storeName={name}
      storeAddress={address}
      storePhone={phone}
      storeReceiptFooter={receiptFooter}
      transaction={dummyTransaction}
  />
  ```
- [ ] **Step 2: Commit**
  Run: `git add resources/js/pages/settings/store.tsx && git commit -m "feat: pass dummyTransaction to ReceiptCard in store settings"`

---

### Task 3: Build and Verify
- [ ] **Step 1: Run npm build to verify TypeScript and Bundling**
  Run: `npm run build`
  Expected: Successful compilation.
