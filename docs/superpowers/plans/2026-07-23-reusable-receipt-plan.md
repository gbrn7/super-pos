# Reusable Receipt Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the receipt rendering logic from the cashier-specific receipt modal to a reusable `ReceiptCard` component so it can be shared between the cashier checkout flow and the store settings preview.

**Architecture:** Split UI layers into `ReceiptCard` (pure presentation of the receipt slip) and `ReceiptModal` (the dialog wrapper with action buttons). Integrate dynamic store settings from the database in the Cashier page.

**Tech Stack:** React 19, TypeScript, TailwindCSS v4, Inertia.js v3, Pest PHP testing framework.

## Global Constraints
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.
- If we receive an "ViteException: Unable to locate file in Vite manifest" error, we can run `npm run build`.

---

### Task 1: Pass Store Settings to Cashier Index Page
**Files:**
- Modify: [CashierController.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Controllers/CashierController.php)
- Test: [CashierCheckoutTest.php](file:///home/raygbrn/project/laravel/super-pos/tests/Feature/Cashier/CashierCheckoutTest.php)

**Interfaces:**
- Consumes: None.
- Produces: `storeSetting` prop passed to cashier/index page.

- [ ] **Step 1: Write test to verify cashier page displays and receives storeSetting prop**
  Add this test inside [CashierCheckoutTest.php](file:///home/raygbrn/project/laravel/super-pos/tests/Feature/Cashier/CashierCheckoutTest.php):
  ```php
  test('cashier index page displays with store settings', function () {
      $user = cashierSetupUser();
      
      $response = $this->actingAs($user)->get('/cashier');
      
      $response->assertStatus(200);
      $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
          ->component('cashier/index')
          ->has('storeSetting')
          ->where('storeSetting.name', 'Toko Maju Jaya')
      );
  });
  ```
- [ ] **Step 2: Run test to verify it fails**
  Run: `php artisan test tests/Feature/Cashier/CashierCheckoutTest.php --filter="cashier index page displays with store settings"`
  Expected: Fail/Error because `storeSetting` is not passed or asserting on Inertia view details.
- [ ] **Step 3: Modify CashierController to load StoreSetting**
  Modify [CashierController.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Controllers/CashierController.php) as follows:
  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Support\Enums\TransactionPermissionEnums;
  use Illuminate\Routing\Controllers\HasMiddleware;
  use Illuminate\Routing\Controllers\Middleware;
  use App\Models\StoreSetting;

  class CashierController extends Controller implements HasMiddleware
  {
      public static function middleware(): array
      {
          return [
              new Middleware(
                  'permission:'.TransactionPermissionEnums::CREATE_TRANSACTION->value,
                  only: ['index']
              ),
          ];
      }

      public function index()
      {
          $storeSetting = StoreSetting::first() ?? new StoreSetting([
              'name' => 'Toko Maju Jaya',
              'address' => 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
              'phone' => '081234567890',
              'email' => 'contact@majujaya.com',
          ]);

          return inertia('cashier/index', [
              'storeSetting' => $storeSetting,
          ]);
      }
  }
  ```
- [ ] **Step 4: Format PHP files**
  Run: `vendor/bin/pint --dirty --format agent`
- [ ] **Step 5: Run tests to verify it passes**
  Run: `php artisan test tests/Feature/Cashier/CashierCheckoutTest.php`
  Expected: PASS
- [ ] **Step 6: Commit**
  Run: `git add app/Http/Controllers/CashierController.php tests/Feature/Cashier/CashierCheckoutTest.php && git commit -m "feat: pass storeSetting prop to cashier page"`

---

### Task 2: Create Reusable `ReceiptCard` Component
**Files:**
- Create: [receipt-card.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/components/receipt-card.tsx)

**Interfaces:**
- Consumes: `Transaction` type from `@/support/models/transaction`.
- Produces: `ReceiptCard` component accepting `storeName`, `storeAddress`, `storePhone`, `storeReceiptFooter`, `transaction`, and `isPreview`.

- [ ] **Step 1: Write `resources/js/components/receipt-card.tsx`**
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
      transaction?: Transaction | null;
      isPreview?: boolean;
  }

  export default function ReceiptCard({
      storeName,
      storeAddress,
      storePhone,
      storeReceiptFooter,
      transaction,
      isPreview = false,
  }: ReceiptCardProps) {
      const { t } = useTranslation();

      // Format price helper (removes Rp prefix and trims spaces)
      const formatPrice = (val: number) => {
          return formatRupiah(val).replace('Rp', '').trim();
      };

      const details = isPreview
          ? [
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
            ]
          : (transaction?.details ?? []);

      const invoiceNumber = isPreview
          ? 'INV/20260723/0001'
          : (transaction?.invoice_number ?? '');

      const paymentMethodName = isPreview
          ? 'Cash'
          : (transaction?.payment_method_name ?? 'Cash');

      const createdAt = isPreview
          ? '23/07/2026 08:42'
          : (transaction?.created_at
              ? (typeof transaction.created_at === 'number'
                  ? dayjs.unix(transaction.created_at).format('DD/MM/YYYY HH:mm')
                  : dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm'))
              : dayjs().format('DD/MM/YYYY HH:mm'));

      const discountAmount = isPreview
          ? 0
          : Number(transaction?.discount_amount ?? 0);

      const totalItemDiscount = isPreview
          ? 0
          : details.reduce(
              (acc, detail) => acc + (Number(detail.discount) || 0) * detail.quantity,
              0,
          );

      const grossSubtotal = isPreview
          ? 48000
          : details.reduce(
              (acc, detail) => acc + (Number(detail.price) || 0) * detail.quantity,
              0,
          );

      const netItemsSubtotal = grossSubtotal - totalItemDiscount;
      const totalSavings = totalItemDiscount + discountAmount;
      const hasTransactionDiscount = discountAmount > 0;

      const totalAmount = isPreview ? 48000 : Number(transaction?.total_amount ?? 0);
      const paymentAmount = isPreview ? 50000 : Number(transaction?.payment_amount ?? 0);
      const changeAmount = isPreview ? 2000 : Number(transaction?.change_amount ?? 0);

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
                  {(isPreview || (transaction && transaction.user_name)) && (
                      <div className="flex items-center justify-between">
                          <span>
                              {t('page.kasir.receipt_cashier', 'Kasir')}
                          </span>
                          <span className="font-medium text-foreground">
                              {isPreview
                                  ? t('page.settings.store.receipt_preview.mock_cashier', 'Admin')
                                  : transaction?.user_name}
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
  Run: `git add resources/js/components/receipt-card.tsx && git commit -m "feat: create reusable ReceiptCard component"`

---

### Task 3: Create Reusable `ReceiptModal` Component
**Files:**
- Create: [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/components/receipt-modal.tsx)

**Interfaces:**
- Consumes: `<ReceiptCard>` component from `./receipt-card`.
- Produces: `ReceiptModal` component wrapper.

- [ ] **Step 1: Write `resources/js/components/receipt-modal.tsx`**
  ```tsx
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
  import type { Transaction } from '@/support/models/transaction';
  import ReceiptCard from './receipt-card';

  export interface StoreSetting {
      id?: number;
      name: string;
      address: string;
      phone: string;
      email?: string | null;
      tax_number?: string | null;
      receipt_footer?: string | null;
  }

  interface ReceiptModalProps {
      open: boolean;
      transaction: Transaction | null;
      storeSetting?: StoreSetting | null;
      onClose: () => void;
      onNewTransaction: () => void;
  }

  export default function ReceiptModal({
      open,
      transaction,
      storeSetting,
      onClose,
      onNewTransaction,
  }: ReceiptModalProps) {
      const { t } = useTranslation();

      if (!transaction) {
          return null;
      }

      // Default fallback settings
      const finalStoreSetting = storeSetting || {
          name: 'Toko Maju Jaya',
          address: 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
          phone: '081234567890',
          receipt_footer: null,
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
                              {t('page.kasir.checkout_success', 'Transaksi Berhasil!')}
                          </DialogTitle>
                      </div>
                  </DialogHeader>

                  {/* Printable Receipt Card */}
                  <ReceiptCard
                      storeName={finalStoreSetting.name}
                      storeAddress={finalStoreSetting.address}
                      storePhone={finalStoreSetting.phone}
                      storeReceiptFooter={finalStoreSetting.receipt_footer}
                      transaction={transaction}
                      isPreview={false}
                  />

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
  ```
- [ ] **Step 2: Delete old `resources/js/pages/cashier/components/receipt-modal.tsx`**
  Run: `rm resources/js/pages/cashier/components/receipt-modal.tsx`
- [ ] **Step 3: Commit**
  Run: `git rm resources/js/pages/cashier/components/receipt-modal.tsx && git add resources/js/components/receipt-modal.tsx && git commit -m "feat: create reusable ReceiptModal and remove the old cashier receipt-modal"`

---

### Task 4: Integrate new `ReceiptModal` in Cashier Page
**Files:**
- Modify: [index.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/index.tsx)

**Interfaces:**
- Consumes: `<ReceiptModal>` from `@/components/receipt-modal`.
- Produces: Cashier page using dynamic `storeSetting` values.

- [ ] **Step 1: Modify `resources/js/pages/cashier/index.tsx` to receive `storeSetting` prop and update imports**
  Modify line 58 and components call. Let's make the changes:
  ```diff
  -import ReceiptModal from './components/receipt-modal';
  +import ReceiptModal from '@/components/receipt-modal';
  ```
  And define the props on the main page export:
  ```diff
  -export default function CashierIndex() {
  +export interface StoreSetting {
  +    id?: number;
  +    name: string;
  +    address: string;
  +    phone: string;
  +    email?: string | null;
  +    tax_number?: string | null;
  +    receipt_footer?: string | null;
  +}
  +
  +export default function CashierIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
  ```
  Then pass it to `<ReceiptModal>` around line 1626:
  ```diff
               {/* Receipt Modal */}
               <ReceiptModal
                   open={receiptOpen}
                   transaction={lastTransaction}
  +                storeSetting={storeSetting}
                   onClose={() => setReceiptOpen(false)}
                   onNewTransaction={handleNewTransaction}
               />
  ```
- [ ] **Step 2: Commit**
  Run: `git add resources/js/pages/cashier/index.tsx && git commit -m "feat: integrate reusable ReceiptModal in Cashier page"`

---

### Task 5: Refactor Store Settings Page to Use `ReceiptCard`
**Files:**
- Modify: [store.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/settings/store.tsx)

**Interfaces:**
- Consumes: `<ReceiptCard>` from `@/components/receipt-card`.
- Produces: Store Settings page with unified receipt preview.

- [ ] **Step 1: Modify `resources/js/pages/settings/store.tsx`**
  Modify imports and replace the hardcoded receipt section:
  Add import:
  ```tsx
  import ReceiptCard from '@/components/receipt-card';
  ```
  Replace lines 259-425 (the `#printable-receipt` div structure) with:
  ```tsx
  {/* Paper Receipt Styling matching receipt-modal.tsx */}
  <ReceiptCard
      storeName={name}
      storeAddress={address}
      storePhone={phone}
      storeReceiptFooter={receiptFooter}
      isPreview={true}
  />
  ```
- [ ] **Step 2: Commit**
  Run: `git add resources/js/pages/settings/store.tsx && git commit -m "feat: use reusable ReceiptCard in Store settings page"`

---

### Task 6: Final Verification
- [ ] **Step 1: Run PHP Feature tests**
  Run: `php artisan test`
  Expected: All tests pass.
- [ ] **Step 2: Run npm build to verify TypeScript and Bundling**
  Run: `npm run build`
  Expected: Successful compilation.
