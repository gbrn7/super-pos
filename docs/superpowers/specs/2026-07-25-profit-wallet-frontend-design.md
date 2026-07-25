# Design Specification: Profit Wallet Frontend & UI Module

*   **Date:** 2026-07-25
*   **Author:** Antigravity AI
*   **Status:** Pending Review

---

## 1. Problem Statement & Goals

The user needs a frontend interface for the Profit Wallet module. This interface will allow merchants and managers to view their net digital sales profit balance, inspect a comprehensive, server-side paginated transaction ledger, and execute financial actions (disbursing profit to owners or withdrawing profit as reinvestment capital).

### Objectives:
*   Expose a new "Keuangan" menu group with a "Dompet Profit" menu item in the Sidebar.
*   Implement permission gating for reading the wallet, disbursing profit, and withdrawing capital.
*   Develop a server-side paginated DataTable with advanced filtering (date ranges, direction type, action category, keyword notes/invoice search).
*   Create separate dialog modals for "Cairkan Profit" (Disburse) and "Tarik Modal" (Withdraw Capital) featuring full currency input formatting and Zod-based validation.
*   Enforce absolute client-side multilingual translation support (Indonesian and English) inside locales JSON configuration.

---

## 2. Component Structures & UI Layout

We will create a new directory `resources/js/pages/profit-wallet/` containing the main entry, table column definitions, the table shell, and form dialogs.

```
resources/js/
├── components/
│   └── app-sidebar.tsx           # Add menu group
├── support/
│   └── enums/
│       └── PermissionEnums.ts    # Add Profit Wallet permissions
└── pages/
    └── profit-wallet/            # New Page Module
        ├── index.tsx             # Main page entry
        ├── columns.tsx           # TanStack table column definitions
        ├── data-table.tsx        # Datatable layout & filters
        └── dialog-modal/
            ├── disburse-dialog.tsx           # Disburse form modal
            └── withdraw-capital-dialog.tsx   # Reinvest form modal
```

### 2.1 Web Route & Web Controller (Backend)

*   **Web Route (`routes/web.php`):**
    ```php
    Route::resource('profit-wallet', ProfitWalletController::class)->only('index');
    ```
*   **Web Controller (`app/Http/Controllers/ProfitWalletController.php`):**
    ```php
    namespace App\Http\Controllers;

    use App\Support\Enums\ProfitWalletPermissionEnums;
    use Illuminate\Routing\Controllers\HasMiddleware;
    use Illuminate\Routing\Controllers\Middleware;
    use Inertia\Inertia;
    use Inertia\Response;

    class ProfitWalletController extends Controller implements HasMiddleware
    {
        public static function middleware(): array
        {
            return [
                new Middleware(
                    'permission:' . ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value,
                    only: ['index']
                ),
            ];
        }

        public function index(): Response
        {
            return Inertia::render('profit-wallet/index');
        }
    }
    ```

### 2.2 Permissions Mapping (`PermissionEnums.ts`)

Update `resources/js/support/enums/PermissionEnums.ts`:
```typescript
enum ProfitWalletPermissionEnums {
    CREATE = 'create-profit-wallet',
    READ = 'read-profit-wallet',
    DISBURSE = 'disburse-profit-wallet',
    WITHDRAW_CAPITAL = 'withdraw-capital-profit-wallet',
}

export const PERMISSIONENUMS = {
    // ...
    PROFIT_WALLET: ProfitWalletPermissionEnums,
};

// Inside PERMISSIONLIST()
{
    LABEL: t('permission_label.profit_wallet.permission', 'Dompet Profit'),
    ACCESSLIST: [
        {
            LABEL: t('permission_label.profit_wallet.read', 'Baca Dompet Profit'),
            VALUE: ProfitWalletPermissionEnums.READ,
        },
        {
            LABEL: t('permission_label.profit_wallet.disburse', 'Pencairan Dana'),
            VALUE: ProfitWalletPermissionEnums.DISBURSE,
        },
        {
            LABEL: t('permission_label.profit_wallet.withdraw_capital', 'Penarikan Modal'),
            VALUE: ProfitWalletPermissionEnums.WITHDRAW_CAPITAL,
        },
    ],
}
```

### 2.3 Sidebar Menu Registration (`app-sidebar.tsx`)

Add group right after Penjualan:
```typescript
{
    title: t('component.sidebar.group_finance', 'Keuangan'),
    items: [
        {
            title: t('component.sidebar.profit_wallet_menu_label', 'Dompet Profit'),
            href: '/profit-wallet', // or profitWallet() when wayfinder is generated
            icon: Wallet, // Import from lucide-react
            permission: PERMISSIONENUMS.PROFIT_WALLET.READ,
            role: [],
        },
    ],
}
```

---

## 3. Translation Files (Multilingual i18n)

Every label must be defined inside `"page"` nesting hierarchy in `locales/{en|id}/translation.json`.

### 3.1 Indonesian (`locales/id/translation.json`)
```json
{
  "page": {
    "profit_wallet": {
      "page_name": "Dompet Profit",
      "cards": {
        "balance": "Saldo Berjalan",
        "inflow": "Total Uang Masuk",
        "outflow": "Total Uang Keluar"
      },
      "dialog_modal": {
        "disburse": {
          "dialog_button": "Cairkan Profit",
          "dialog_title": "Cairkan Profit",
          "dialog_desc": "Cairkan akumulasi profit bersih Anda ke rekening pemilik.",
          "amount_label": "Nominal Pencairan",
          "amount_placeholder": "Masukkan nominal pencairan",
          "notes_label": "Catatan",
          "notes_placeholder": "Masukkan catatan pencairan (misal: Transfer BCA Owner)",
          "cancel_btn": "Batal",
          "confirm_btn": "Cairkan"
        },
        "withdraw_capital": {
          "dialog_button": "Tarik Modal",
          "dialog_title": "Tarik Modal Kembali",
          "dialog_desc": "Tarik profit bersih Anda untuk diinvestasikan kembali sebagai modal operasional.",
          "amount_label": "Nominal Modal",
          "amount_placeholder": "Masukkan nominal penarikan modal",
          "notes_label": "Catatan",
          "notes_placeholder": "Masukkan catatan modal (misal: Reinvestasi Kas Toko)",
          "cancel_btn": "Batal",
          "confirm_btn": "Tarik"
        }
      },
      "data_table": {
        "filters": {
          "type_label": "Arah Aliran",
          "type_placeholder": "Semua Arah",
          "direction_in": "Uang Masuk",
          "direction_out": "Uang Keluar",
          "tx_type_label": "Jenis Transaksi",
          "tx_type_placeholder": "Semua Jenis",
          "tx_sales_profit": "Keuntungan Penjualan",
          "tx_disbursement": "Pencairan Profit",
          "tx_capital_withdrawal": "Penarikan Modal"
        },
        "columns": {
          "created_at": "Waktu Mutasi",
          "tx_type": "Jenis Transaksi",
          "direction": "Arah Aliran",
          "amount": "Jumlah",
          "balance_before": "Saldo Awal",
          "balance_after": "Saldo Akhir",
          "notes": "Catatan",
          "reference": "Rujukan"
        }
      }
    }
  },
  "permission_label": {
    "profit_wallet": {
      "permission": "Dompet Profit",
      "read": "Baca Dompet Profit",
      "disburse": "Pencairan Dana",
      "withdraw_capital": "Penarikan Modal"
    }
  },
  "component": {
    "sidebar": {
      "group_finance": "Keuangan",
      "profit_wallet_menu_label": "Dompet Profit"
    }
  }
}
```

### 3.2 English (`locales/en/translation.json`)
```json
{
  "page": {
    "profit_wallet": {
      "page_name": "Profit Wallet",
      "cards": {
        "balance": "Current Balance",
        "inflow": "Total Inflow",
        "outflow": "Total Outflow"
      },
      "dialog_modal": {
        "disburse": {
          "dialog_button": "Disburse Profit",
          "dialog_title": "Disburse Profit",
          "dialog_desc": "Disburse your accumulated net profits to the owner's bank account.",
          "amount_label": "Disbursement Amount",
          "amount_placeholder": "Enter disbursement amount",
          "notes_label": "Notes",
          "notes_placeholder": "Enter disbursement notes (e.g. Owner BCA Transfer)",
          "cancel_btn": "Cancel",
          "confirm_btn": "Disburse"
        },
        "withdraw_capital": {
          "dialog_button": "Withdraw Capital",
          "dialog_title": "Withdraw Reinvestment Capital",
          "dialog_desc": "Withdraw net profit to reinvest back into shop operational capital.",
          "amount_label": "Capital Amount",
          "amount_placeholder": "Enter capital amount",
          "notes_label": "Notes",
          "notes_placeholder": "Enter capital notes (e.g. Store Reinvestment)",
          "cancel_btn": "Cancel",
          "confirm_btn": "Withdraw"
        }
      },
      "data_table": {
        "filters": {
          "type_label": "Direction",
          "type_placeholder": "All Directions",
          "direction_in": "Inflow",
          "direction_out": "Outflow",
          "tx_type_label": "Transaction Type",
          "tx_type_placeholder": "All Types",
          "tx_sales_profit": "Sales Profit",
          "tx_disbursement": "Disbursement",
          "tx_capital_withdrawal": "Capital Withdrawal"
        },
        "columns": {
          "created_at": "Transaction Time",
          "tx_type": "Transaction Type",
          "direction": "Direction",
          "amount": "Amount",
          "balance_before": "Opening Balance",
          "balance_after": "Closing Balance",
          "notes": "Notes",
          "reference": "Reference"
        }
      }
    }
  },
  "permission_label": {
    "profit_wallet": {
      "permission": "Profit Wallet",
      "read": "Read Profit Wallet",
      "disburse": "Disburse Funds",
      "withdraw_capital": "Withdraw Capital"
    }
  },
  "component": {
    "sidebar": {
      "group_finance": "Finance",
      "profit_wallet_menu_label": "Profit Wallet"
    }
  }
}
```

---

## 4. Dialog Modal Implementations

We will implement two separate forms utilizing `<NumericFormat>` for proper Indonesian Rupiah pricing entry formatting.

### 4.1 Zod Form Validation Schemas
```typescript
const disburseSchema = z.object({
    amount: z.number().min(0.01, t('validation.profit_wallet.min_amount', 'Nominal pencairan minimal Rp 0.01')),
    notes: z.string().max(500, t('validation.profit_wallet.max_notes', 'Catatan maksimal 500 karakter')).optional(),
});
```

### 4.2 NumericFormat Currency Component Integration
```tsx
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';

<NumericFormat
    thousandSeparator="."
    decimalSeparator=","
    prefix="Rp "
    allowNegative={false}
    customInput={Input}
    value={formData.amount}
    onValueChange={(values) => {
        const { floatValue } = values;
        setFormData(prev => ({ ...prev, amount: floatValue || 0 }));
    }}
/>
```

---

## 5. Testing & Verification

We will write:
*   **Web Controller Feature Tests**: `tests/Feature/ProfitWallet/ProfitWalletWebTest.php` ensuring:
    - Guests are redirected to login.
    - Non-admin users are blocked with 403 Forbidden.
    - Admins can visit `/profit-wallet` and get Inertia render page response.
*   **TypeScript Compilation**: Run TypeScript type-checker: `npx tsc --noEmit` and Vite build check to verify frontend integrity.
