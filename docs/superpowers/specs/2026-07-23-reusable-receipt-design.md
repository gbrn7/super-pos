# Reusable Receipt Component Design

## Overview
This design doc specifies the extraction of the receipt rendering logic from the hardcoded `ReceiptModal` inside `resources/js/pages/cashier/components/receipt-modal.tsx` into a reusable `ReceiptCard` component under `resources/js/components`. It also refactors the cashier receipt and store settings pages to use this new reusable component, ensuring consistency and dynamically loading store settings.

## Design Details

### 1. Reusable Components

#### `ReceiptCard` (`resources/js/components/receipt-card.tsx`)
This is the presentation component representing the physical/paper receipt.
- **Props**:
  ```typescript
  import type { Transaction } from '@/support/models/transaction';

  export interface ReceiptCardProps {
      storeName: string;
      storeAddress: string;
      storePhone: string;
      storeReceiptFooter?: string | null;
      transaction?: Transaction | null;
      isPreview?: boolean;
  }
  ```
- **Modes**:
  - `isPreview = true`: Renders mock data (e.g. mock items: "Kopi Susu Gula Aren", "Roti Bakar Cokelat", and standard mock pricing totals) for immediate layout preview in settings.
  - `isPreview = false`: Renders dynamic transaction data from the `transaction` prop, using existing calculations (discount, savings, payments, change, date, payment method).

#### `ReceiptModal` (`resources/js/components/receipt-modal.tsx`)
A dialog wrapper around `ReceiptCard` for cashier checkout flow.
- **Props**:
  ```typescript
  import type { Transaction } from '@/support/models/transaction';

  export interface StoreSetting {
      id?: number;
      name: string;
      address: string;
      phone: string;
      email?: string | null;
      tax_number?: string | null;
      receipt_footer?: string | null;
  }

  export interface ReceiptModalProps {
      open: boolean;
      transaction: Transaction | null;
      storeSetting?: StoreSetting | null;
      onClose: () => void;
      onNewTransaction: () => void;
  }
  ```
- **Layout**: Wraps `<ReceiptCard>` in `<Dialog>` / `<DialogContent>`, and provides print/action buttons in the footer.

### 2. Integration & Dynamic Store Settings

#### Cashier Backend (`app/Http/Controllers/CashierController.php`)
Pass the saved store settings to the Cashier page.
- Load `StoreSetting::first()` in the `index` method, or fall back to default attributes if database is empty.
- Send it to Inertia via `inertia('cashier/index', ['storeSetting' => $storeSetting])`.

#### Cashier Page (`resources/js/pages/cashier/index.tsx`)
- Receive `storeSetting` prop.
- Replace local `import ReceiptModal from './components/receipt-modal'` with `import ReceiptModal from '@/components/receipt-modal'`.
- Pass `storeSetting` to `<ReceiptModal>`.

#### Store Settings Page (`resources/js/pages/settings/store.tsx`)
- Delete the static receipt preview HTML layout code.
- Import `ReceiptCard` from `@/components/receipt-card`.
- Replace with `<ReceiptCard storeName={name} storeAddress={address} storePhone={phone} storeReceiptFooter={receiptFooter} isPreview={true} />` to reflect real-time user input in settings.

## Verification & Testing Plan
1. **Pest Tests**: Run backend feature tests (`php artisan test tests/Feature/Cashier/CashierCheckoutTest.php` and `tests/Feature/Settings/StoreSettingTest.php`) to ensure that adding store settings to cashier route doesn't break cashier/checkout endpoint logic.
2. **Visual Verification**: Run Vite build/dev server (`npm run build`) to ensure TypeScript compiles correctly and no bundler errors are introduced.
