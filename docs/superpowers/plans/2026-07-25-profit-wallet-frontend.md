# Profit Wallet Frontend & UI Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frontend UI for the Profit Wallet module (including Web controller, routes, sidebar menu navigation, Spatie permissions mapping, Indonesian/English locales, disburse and withdraw capital modals, and server-side paginated DataTable ledger view).

**Tech Stack:** PHP 8.4, Laravel 13, React 19, Inertia.js v3, Tailwind CSS v4, Lucide React, react-i18next.

---

## Tasks

### Task 1: Web Route, Web Controller, and Backend Tests

**Files:**
*   Create: `app/Http/Controllers/ProfitWalletController.php`
*   Modify: `routes/web.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletWebTest.php`

- [ ] **Step 1: Write Web Controller**

`app/Http/Controllers/ProfitWalletController.php`:
```php
<?php

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

- [ ] **Step 2: Add Web Resource Route**

Modify `routes/web.php`:
Add import:
```php
use App\Http\Controllers\ProfitWalletController;
```
Inside the `Route::middleware(['auth', 'verified'])->group` block (around line 58):
```php
    Route::resource('profit-wallet', ProfitWalletController::class)->only('index');
```

- [ ] **Step 3: Write Backend Access Test**

`tests/Feature/ProfitWallet/ProfitWalletWebTest.php`:
```php
<?php

use App\Models\User;
use App\Support\Enums\ProfitWalletPermissionEnums;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

test('profit-wallet page requires authentication', function () {
    $this->get(route('profit-wallet.index'))
        ->assertRedirect(route('login'));
});

test('profit-wallet page requires read-profit-wallet permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('profit-wallet.index'))
        ->assertStatus(403);
});

test('profit-wallet page renders for admin user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('profit-wallet.index'))
        ->assertOk();
});
```

- [ ] **Step 4: Verify backend tests**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletWebTest.php --compact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ProfitWalletController.php routes/web.php tests/Feature/ProfitWallet/ProfitWalletWebTest.php
git commit -m "feat(profit-wallet): add web controller, routes, and backend auth tests"
```

---

### Task 2: Sidebar Menu, Permissions Mapping, & Locales Setup

**Files:**
*   Modify: `resources/js/support/enums/PermissionEnums.ts`
*   Modify: `resources/js/components/app-sidebar.tsx`
*   Modify: `resources/js/locales/id/translation.json`
*   Modify: `resources/js/locales/en/translation.json`

- [ ] **Step 1: Update PermissionEnums.ts**

Modify `resources/js/support/enums/PermissionEnums.ts`:
Add enum definition (around line 63):
```typescript
enum ProfitWalletPermissionEnums {
    CREATE = 'create-profit-wallet',
    READ = 'read-profit-wallet',
    DISBURSE = 'disburse-profit-wallet',
    WITHDRAW_CAPITAL = 'withdraw-capital-profit-wallet',
}
```
Inject `PROFIT_WALLET` to `PERMISSIONENUMS` object:
```typescript
export const PERMISSIONENUMS = {
    // ...
    PROFIT_WALLET: ProfitWalletPermissionEnums,
};
```
Append to `PERMISSIONLIST()` array:
```typescript
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
        },
```

- [ ] **Step 2: Update app-sidebar.tsx**

Modify `resources/js/components/app-sidebar.tsx`:
Add import:
```typescript
import { Wallet } from 'lucide-react';
import { index as profitWallet } from '@/routes/profit-wallet';
```
Add new group in `navGroups` between inventory group and system group (around line 170):
```typescript
        {
            title: t('component.sidebar.group_finance', 'Keuangan'),
            items: [
                {
                    title: t('component.sidebar.profit_wallet_menu_label', 'Dompet Profit'),
                    href: profitWallet(),
                    icon: Wallet,
                    permission: PERMISSIONENUMS.PROFIT_WALLET.READ,
                    role: [],
                },
            ],
        },
```

- [ ] **Step 3: Add Locales Translations**

Read current locales files to preserve existing structure.
Modify `resources/js/locales/id/translation.json`:
Add inside `"page"` object:
```json
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
```
Add inside `"permission_label"` object:
```json
    "profit_wallet": {
      "permission": "Dompet Profit",
      "read": "Baca Dompet Profit",
      "disburse": "Pencairan Dana",
      "withdraw_capital": "Penarikan Modal"
    }
```
Add inside `"component" -> "sidebar"` object:
```json
      "group_finance": "Keuangan",
      "profit_wallet_menu_label": "Dompet Profit"
```

Modify `resources/js/locales/en/translation.json`:
Add inside `"page"` object:
```json
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
```
Add inside `"permission_label"` object:
```json
    "profit_wallet": {
      "permission": "Profit Wallet",
      "read": "Read Profit Wallet",
      "disburse": "Disburse Funds",
      "withdraw_capital": "Withdraw Capital"
    }
```
Add inside `"component" -> "sidebar"` object:
```json
      "group_finance": "Finance",
      "profit_wallet_menu_label": "Profit Wallet"
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/support/enums/PermissionEnums.ts resources/js/components/app-sidebar.tsx resources/js/locales/id/translation.json resources/js/locales/en/translation.json
git commit -m "feat(profit-wallet): register permissions, sidebar menu, and Indonesian/English translations"
```

---

### Task 3: Dialog Modals for Disburse & Withdraw Capital

**Files:**
*   Create: `resources/js/pages/profit-wallet/dialog-modal/disburse-dialog.tsx`
*   Create: `resources/js/pages/profit-wallet/dialog-modal/withdraw-capital-dialog.tsx`

- [ ] **Step 1: Write Disburse Dialog Modal**

`resources/js/pages/profit-wallet/dialog-modal/disburse-dialog.tsx`:
```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface DisburseDialogProps {
    onSuccess: () => void;
}

export function DisburseDialog({ onSuccess }: DisburseDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        amount: 0,
        notes: '',
    });

    const [errorForm, setErrorForm] = useState({
        amount: '',
        notes: '',
    });

    const schema = z.object({
        amount: z.number().min(0.01, t('validation.profit_wallet.min_amount', 'Nominal pencairan minimal Rp 0.01')),
        notes: z.string().max(500, t('validation.profit_wallet.max_notes', 'Catatan maksimal 500 karakter')).optional(),
    });

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrorForm((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const resultValidation = schema.safeParse(formData);
        if (!resultValidation.success) {
            const fieldErrors = { amount: '', notes: '' };
            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as 'amount' | 'notes';
                fieldErrors[fieldName] = error.message;
            });
            setErrorForm(fieldErrors);
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post('/api/profit-wallet/disburse', formData);

            if (!res.data.success) {
                showWarningToast(res.data.message);
                return;
            }

            showSuccessToast(res.data.message);
            setFormData({ amount: 0, notes: '' });
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error disbursing profit:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl py-2.5 flex items-center justify-center gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    {t('page.profit_wallet.dialog_modal.disburse.dialog_button', 'Cairkan Profit')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            {t('page.profit_wallet.dialog_modal.disburse.dialog_title', 'Cairkan Profit')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('page.profit_wallet.dialog_modal.disburse.dialog_desc', 'Cairkan akumulasi profit bersih Anda ke rekening pemilik.')}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="amount" className="text-sm font-medium text-foreground">
                                {t('page.profit_wallet.dialog_modal.disburse.amount_label', 'Nominal Pencairan')}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                allowNegative={false}
                                customInput={Input}
                                id="amount"
                                placeholder={t('page.profit_wallet.dialog_modal.disburse.amount_placeholder', 'Masukkan nominal pencairan')}
                                value={formData.amount === 0 ? '' : formData.amount}
                                onValueChange={(values) => {
                                    const { floatValue } = values;
                                    setFormData((prev) => ({ ...prev, amount: floatValue || 0 }));
                                    setErrorForm((prev) => ({ ...prev, amount: '' }));
                                }}
                                disabled={loading}
                                className={`${errorForm.amount && 'border-red-500'}`}
                            />
                            {errorForm.amount && <ErrorFormInfo message={errorForm.amount} />}
                        </Field>
                        <Field>
                            <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                {t('page.profit_wallet.dialog_modal.disburse.notes_label', 'Catatan')}
                            </label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder={t('page.profit_wallet.dialog_modal.disburse.notes_placeholder', 'Masukkan catatan pencairan (misal: Transfer BCA Owner)')}
                                value={formData.notes}
                                onChange={handleNotesChange}
                                disabled={loading}
                                rows={3}
                                className={`${errorForm.notes && 'border-red-500'}`}
                            />
                            {errorForm.notes && <ErrorFormInfo message={errorForm.notes} />}
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                {t('page.profit_wallet.dialog_modal.disburse.cancel_btn', 'Batal')}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading ? <Spinner /> : t('page.profit_wallet.dialog_modal.disburse.confirm_btn', 'Cairkan')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 2: Write Withdraw Capital Dialog Modal**

`resources/js/pages/profit-wallet/dialog-modal/withdraw-capital-dialog.tsx`:
```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';
import axiosInstance from '@/lib/axios';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import {
    handleApiError,
    showSuccessToast,
    showWarningToast,
} from '@/lib/utils';
import { Landmark } from 'lucide-react';
import z from 'zod';
import ErrorFormInfo from '@/components/errorFormInfo';

interface WithdrawCapitalDialogProps {
    onSuccess: () => void;
}

export function WithdrawCapitalDialog({ onSuccess }: WithdrawCapitalDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        amount: 0,
        notes: '',
    });

    const [errorForm, setErrorForm] = useState({
        amount: '',
        notes: '',
    });

    const schema = z.object({
        amount: z.number().min(0.01, t('validation.profit_wallet.min_amount', 'Nominal penarikan modal minimal Rp 0.01')),
        notes: z.string().max(500, t('validation.profit_wallet.max_notes', 'Catatan maksimal 500 karakter')).optional(),
    });

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrorForm((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const resultValidation = schema.safeParse(formData);
        if (!resultValidation.success) {
            const fieldErrors = { amount: '', notes: '' };
            resultValidation.error.issues.forEach((error) => {
                const fieldName = error.path[0] as 'amount' | 'notes';
                fieldErrors[fieldName] = error.message;
            });
            setErrorForm(fieldErrors);
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post('/api/profit-wallet/withdraw-capital', formData);

            if (!res.data.success) {
                showWarningToast(res.data.message);
                return;
            }

            showSuccessToast(res.data.message);
            setFormData({ amount: 0, notes: '' });
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Error withdrawing capital:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-xl py-2.5 flex items-center justify-center gap-2">
                    <Landmark className="h-4 w-4" />
                    {t('page.profit_wallet.dialog_modal.withdraw_capital.dialog_button', 'Tarik Modal')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>
                            {t('page.profit_wallet.dialog_modal.withdraw_capital.dialog_title', 'Tarik Modal Kembali')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('page.profit_wallet.dialog_modal.withdraw_capital.dialog_desc', 'Tarik profit bersih Anda untuk diinvestasikan kembali sebagai modal operasional.')}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <label htmlFor="amount" className="text-sm font-medium text-foreground">
                                {t('page.profit_wallet.dialog_modal.withdraw_capital.amount_label', 'Nominal Modal')}
                                <span className="text-red-500"> *</span>
                            </label>
                            <NumericFormat
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="Rp "
                                allowNegative={false}
                                customInput={Input}
                                id="amount"
                                placeholder={t('page.profit_wallet.dialog_modal.withdraw_capital.amount_placeholder', 'Masukkan nominal penarikan modal')}
                                value={formData.amount === 0 ? '' : formData.amount}
                                onValueChange={(values) => {
                                    const { floatValue } = values;
                                    setFormData((prev) => ({ ...prev, amount: floatValue || 0 }));
                                    setErrorForm((prev) => ({ ...prev, amount: '' }));
                                }}
                                disabled={loading}
                                className={`${errorForm.amount && 'border-red-500'}`}
                            />
                            {errorForm.amount && <ErrorFormInfo message={errorForm.amount} />}
                        </Field>
                        <Field>
                            <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                {t('page.profit_wallet.dialog_modal.withdraw_capital.notes_label', 'Catatan')}
                            </label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder={t('page.profit_wallet.dialog_modal.withdraw_capital.notes_placeholder', 'Masukkan catatan modal (misal: Reinvestasi Kas Toko)')}
                                value={formData.notes}
                                onChange={handleNotesChange}
                                disabled={loading}
                                rows={3}
                                className={`${errorForm.notes && 'border-red-500'}`}
                            />
                            {errorForm.notes && <ErrorFormInfo message={errorForm.notes} />}
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                {t('page.profit_wallet.dialog_modal.withdraw_capital.cancel_btn', 'Batal')}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="bg-slate-600 hover:bg-slate-700 text-white">
                            {loading ? <Spinner /> : t('page.profit_wallet.dialog_modal.withdraw_capital.confirm_btn', 'Tarik')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/profit-wallet/dialog-modal/disburse-dialog.tsx resources/js/pages/profit-wallet/dialog-modal/withdraw-capital-dialog.tsx
git commit -m "feat(profit-wallet): add disburse and withdraw capital dialog forms"
```

---

### Task 4: Main Dompet Profit Page & Server-Side DataTable

**Files:**
*   Create: `resources/js/pages/profit-wallet/columns.tsx`
*   Create: `resources/js/pages/profit-wallet/data-table.tsx`
*   Create: `resources/js/pages/profit-wallet/index.tsx`

- [ ] **Step 1: Write Columns**

`resources/js/pages/profit-wallet/columns.tsx`:
```tsx
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id as localeId, enUS as localeEn } from 'date-fns/locale';
import i18next from 'i18next';
import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/format-money';

export interface ProfitWalletRecord {
    id: number;
    amount: number;
    type: 'in' | 'out';
    transaction_type: 'sales_profit' | 'disbursement' | 'capital_withdrawal';
    balance_before: number;
    balance_after: number;
    notes: string;
    invoice_number: string;
    created_at: number;
}

interface ColumnProps {
    onInvoiceClick: (invoiceNumber: string) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy?: string;
    order?: string;
}

export const columns = ({ onInvoiceClick, onSortChange, orderBy, order }: ColumnProps): ColumnDef<ProfitWalletRecord>[] => [
    {
        accessorKey: 'created_at',
        header: () => i18next.t('page.profit_wallet.data_table.columns.created_at', 'Waktu Mutasi'),
        cell: ({ row }) => {
            const timestamp = row.original.created_at * 1000;
            const currentLang = i18next.language === 'id' ? localeId : localeEn;
            return <span className="whitespace-nowrap">{format(new Date(timestamp), 'dd MMM yyyy, HH:mm', { locale: currentLang })}</span>;
        },
    },
    {
        accessorKey: 'transaction_type',
        header: () => i18next.t('page.profit_wallet.data_table.columns.tx_type', 'Jenis Transaksi'),
        cell: ({ row }) => {
            const txType = row.original.transaction_type;
            let label = txType;
            if (txType === 'sales_profit') {
                label = i18next.t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan Penjualan');
            } else if (txType === 'disbursement') {
                label = i18next.t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan Profit');
            } else if (txType === 'capital_withdrawal') {
                label = i18next.t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Penarikan Modal');
            }
            return <span className="whitespace-nowrap font-medium">{label}</span>;
        },
    },
    {
        accessorKey: 'type',
        header: () => i18next.t('page.profit_wallet.data_table.columns.direction', 'Arah Aliran'),
        cell: ({ row }) => {
            const type = row.original.type;
            if (type === 'in') {
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-none font-normal">
                        {i18next.t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk')}
                    </Badge>
                );
            }
            return (
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-none font-normal">
                    {i18next.t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'amount',
        header: () => i18next.t('page.profit_wallet.data_table.columns.amount', 'Jumlah'),
        cell: ({ row }) => {
            const val = row.original.amount;
            const type = row.original.type;
            const sign = type === 'in' ? '+' : '-';
            const colorClass = type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
            return <span className={`font-semibold ${colorClass}`}>{sign} {formatRupiah(val)}</span>;
        },
    },
    {
        accessorKey: 'balance_before',
        header: () => i18next.t('page.profit_wallet.data_table.columns.balance_before', 'Saldo Awal'),
        cell: ({ row }) => formatRupiah(row.original.balance_before),
    },
    {
        accessorKey: 'balance_after',
        header: () => i18next.t('page.profit_wallet.data_table.columns.balance_after', 'Saldo Akhir'),
        cell: ({ row }) => <span className="font-medium text-foreground">{formatRupiah(row.original.balance_after)}</span>,
    },
    {
        accessorKey: 'notes',
        header: () => i18next.t('page.profit_wallet.data_table.columns.notes', 'Catatan'),
        cell: ({ row }) => <span className="text-muted-foreground line-clamp-1">{row.original.notes || '-'}</span>,
    },
    {
        accessorKey: 'reference',
        header: () => i18next.t('page.profit_wallet.data_table.columns.reference', 'Rujukan'),
        cell: ({ row }) => {
            const inv = row.original.invoice_number;
            if (!inv || inv === '-') return <span>-</span>;
            return (
                <button
                    onClick={() => onInvoiceClick(inv)}
                    className="text-primary hover:underline font-medium text-left cursor-pointer"
                >
                    {inv}
                </button>
            );
        },
    },
];
```

- [ ] **Step 2: Write DataTable Shell**

`resources/js/pages/profit-wallet/data-table.tsx`:
```tsx
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/components/table-pagination';
import { TableSkeleton } from '@/components/table-skeleton';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    processing: boolean;
    queryParam: {
        page: number;
        limit: number;
        keyword: string;
        type: string;
        transaction_type: string;
        start_date: string;
        end_date: string;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onQueryParamChange: (key: string, value: any) => void;
    onResetFilter: () => void;
    onChangePaginationPage: (page: number) => void;
    onChangePaginationLimit: (limit: number) => void;
    limitOptions: number[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    processing,
    queryParam,
    pagination,
    onQueryParamChange,
    onResetFilter,
    onChangePaginationPage,
    onChangePaginationLimit,
    limitOptions,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const isFilterActive =
        queryParam.keyword !== '' ||
        queryParam.type !== '' ||
        queryParam.transaction_type !== '' ||
        queryParam.start_date !== '' ||
        queryParam.end_date !== '';

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border p-3">
                <div className="flex justify-between items-center gap-2 overflow-auto mb-3">
                    <h3 className="font-semibold text-lg">{t('page.profit_wallet.data_table.table_title', 'Mutasi Dompet')}</h3>
                    <Button variant="outline" size="sm" onClick={onResetFilter} disabled={processing}>
                        {t('page.profit.filters.reset', 'Reset Filter')}
                    </Button>
                </div>
                <div className="second-row grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 border p-3 rounded-md mb-3">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t('page.profit_wallet.data_table.filters.keyword', 'Kata Kunci')}
                        </Label>
                        <Input
                            placeholder={t('page.profit.filters.keyword_placeholder', 'Cari Catatan / Invoice...')}
                            value={queryParam.keyword}
                            onChange={(e) => onQueryParamChange('keyword', e.target.value)}
                            disabled={processing}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t('page.profit_wallet.data_table.filters.type_label', 'Arah Aliran')}
                        </Label>
                        <Select
                            value={queryParam.type || 'all'}
                            onValueChange={(val) => onQueryParamChange('type', val === 'all' ? '' : val)}
                            disabled={processing}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('page.profit_wallet.data_table.filters.type_placeholder', 'Semua Arah')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('page.profit_wallet.data_table.filters.type_placeholder', 'Semua Arah')}</SelectItem>
                                <SelectItem value="in">{t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk')}</SelectItem>
                                <SelectItem value="out">{t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                            {t('page.profit_wallet.data_table.filters.tx_type_label', 'Jenis Transaksi')}
                        </Label>
                        <Select
                            value={queryParam.transaction_type || 'all'}
                            onValueChange={(val) => onQueryParamChange('transaction_type', val === 'all' ? '' : val)}
                            disabled={processing}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('page.profit_wallet.data_table.filters.tx_type_placeholder', 'Semua Jenis')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('page.profit_wallet.data_table.filters.tx_type_placeholder', 'Semua Jenis')}</SelectItem>
                                <SelectItem value="sales_profit">{t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan Penjualan')}</SelectItem>
                                <SelectItem value="disbursement">{t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan Profit')}</SelectItem>
                                <SelectItem value="capital_withdrawal">{t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Penarikan Modal')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">{t('page.profit.filters.start_date', 'Mulai')}</Label>
                            <Input
                                type="date"
                                value={queryParam.start_date}
                                onChange={(e) => onQueryParamChange('start_date', e.target.value)}
                                disabled={processing}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">{t('page.profit.filters.end_date', 'Hingga')}</Label>
                            <Input
                                type="date"
                                value={queryParam.end_date}
                                onChange={(e) => onQueryParamChange('end_date', e.target.value)}
                                disabled={processing}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {isFilterActive && (
                        <div className="col-span-full flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
                            <span className="text-muted-foreground">{t('page.profit.filters.active_filters', 'Filter Aktif:')}</span>
                            {queryParam.keyword && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    "{queryParam.keyword}"
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => onQueryParamChange('keyword', '')} />
                                </Badge>
                            )}
                            {queryParam.type && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    {queryParam.type === 'in' ? t('page.profit_wallet.data_table.filters.direction_in', 'Uang Masuk') : t('page.profit_wallet.data_table.filters.direction_out', 'Uang Keluar')}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => onQueryParamChange('type', '')} />
                                </Badge>
                            )}
                            {queryParam.transaction_type && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    {queryParam.transaction_type === 'sales_profit' ? t('page.profit_wallet.data_table.filters.tx_sales_profit', 'Keuntungan') : queryParam.transaction_type === 'disbursement' ? t('page.profit_wallet.data_table.filters.tx_disbursement', 'Pencairan') : t('page.profit_wallet.data_table.filters.tx_capital_withdrawal', 'Modal')}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => onQueryParamChange('transaction_type', '')} />
                                </Badge>
                            )}
                            {(queryParam.start_date || queryParam.end_date) && (
                                <Badge variant="secondary" className="gap-1 font-normal py-0.5 px-2 bg-muted/50 hover:bg-muted">
                                    {queryParam.start_date || '*'} s/d {queryParam.end_date || '*'}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                        onQueryParamChange('start_date', '');
                                        onQueryParamChange('end_date', '');
                                    }} />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {processing ? (
                                <TableSkeleton columns={columns.length} rows={queryParam.limit} />
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {t('page.profit.table_empty', 'Tidak ada data.')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <TablePagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                perPage={pagination.per_page}
                limit={queryParam.limit}
                onChangePage={onChangePaginationPage}
                onChangeLimit={onChangePaginationLimit}
                limitOptions={limitOptions}
                disabled={processing}
            />
        </div>
    );
}
```

- [ ] **Step 3: Write Page Index Entry**

`resources/js/pages/profit-wallet/index.tsx`:
```tsx
import { Head } from '@inertiajs/react';
import i18next from 'i18next';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderContent from '@/components/header-content';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatRupiah } from '@/lib/format-money';
import axiosInstance from '@/lib/axios';
import { handleApiError } from '@/lib/utils';
import { index as profitWalletRoute } from '@/routes/profit-wallet';
import { columns, type ProfitWalletRecord } from './columns';
import { DataTable } from './data-table';
import { Can } from '@/components/auth/can';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
import { DisburseDialog } from './dialog-modal/disburse-dialog';
import { WithdrawCapitalDialog } from './dialog-modal/withdraw-capital-dialog';
import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';
import type { StoreSetting } from '@/components/receipt-modal';

interface SummaryData {
    current_balance: number;
    total_inflow: number;
    total_outflow: number;
}

export default function ProfitWalletIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
    const { t } = useTranslation();

    const [ledgerData, setLedgerData] = useState<ProfitWalletRecord[]>([]);
    const [summary, setSummary] = useState<SummaryData>({
        current_balance: 0,
        total_inflow: 0,
        total_outflow: 0,
    });
    const [processing, setProcessing] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const [queryParam, setQueryParam] = useState({
        page: 1,
        limit: 10,
        keyword: '',
        type: '',
        transaction_type: '',
        start_date: '',
        end_date: '',
    });

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const fetchProfitWalletData = useCallback(async () => {
        try {
            setProcessing(true);
            const params: Record<string, any> = { ...queryParam };
            const res = await axiosInstance.get('/api/profit-wallet', { params });
            if (res.data.success) {
                setLedgerData(res.data.data.transactions.data);
                setSummary(res.data.data.summary);
                if (res.data.data.transactions.meta) {
                    setPagination(res.data.data.transactions.meta);
                }
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setProcessing(false);
        }
    }, [queryParam]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchProfitWalletData();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchProfitWalletData]);

    const handleInvoiceClick = async (invoiceNumber: string) => {
        try {
            const res = await axiosInstance.get(`/api/transactions/invoice/${invoiceNumber}`);
            if (res.data.success) {
                setSelectedTransaction(res.data.data);
                setDetailOpen(true);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleQueryParamChange = (key: string, value: any) => {
        setQueryParam((prev) => ({
            ...prev,
            [key]: value,
            ...(key !== 'page' ? { page: 1 } : {}),
        }));
    };

    const handleResetFilter = () => {
        setQueryParam({
            page: 1,
            limit: 10,
            keyword: '',
            type: '',
            transaction_type: '',
            start_date: '',
            end_date: '',
        });
    };

    return (
        <>
            <Head title={t('page.profit_wallet.page_name', 'Dompet Profit')} />
            <div className="mb-16 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <HeaderContent>{t('page.profit_wallet.page_name', 'Dompet Profit')}</HeaderContent>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-emerald-500 shadow-xs flex flex-col justify-between">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit_wallet.cards.balance', 'Saldo Berjalan')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(summary.current_balance)}
                            </CardTitle>
                        </CardHeader>
                        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                            <Can permission={PERMISSIONENUMS.PROFIT_WALLET.DISBURSE}>
                                <DisburseDialog onSuccess={fetchProfitWalletData} />
                            </Can>
                            <Can permission={PERMISSIONENUMS.PROFIT_WALLET.WITHDRAW_CAPITAL}>
                                <WithdrawCapitalDialog onSuccess={fetchProfitWalletData} />
                            </Can>
                        </div>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-sky-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit_wallet.cards.inflow', 'Total Uang Masuk')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                                {formatRupiah(summary.total_inflow)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-rose-500 shadow-xs">
                        <CardHeader className="py-4">
                            <CardDescription>{t('page.profit_wallet.cards.outflow', 'Total Uang Keluar')}</CardDescription>
                            <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {formatRupiah(summary.total_outflow)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Table Component */}
                <DataTable
                    columns={columns({
                        onInvoiceClick: handleInvoiceClick,
                        onSortChange: () => {},
                        orderBy: 'id',
                        order: 'desc',
                    })}
                    data={ledgerData}
                    processing={processing}
                    queryParam={queryParam}
                    pagination={pagination}
                    onQueryParamChange={handleQueryParamChange}
                    onResetFilter={handleResetFilter}
                    onChangePaginationPage={(val) => handleQueryParamChange('page', val)}
                    onChangePaginationLimit={(val) => handleQueryParamChange('limit', val)}
                    limitOptions={[10, 25, 50, 100]}
                />

                {/* Struk / Detail Transaction Modal */}
                {selectedTransaction && (
                    <DetailDialog
                        isOpen={detailOpen}
                        transaction={selectedTransaction}
                        onOpenChange={setDetailOpen}
                        storeSetting={storeSetting}
                    />
                )}
            </div>
        </>
    );
}

ProfitWalletIndex.layout = {
    breadcrumbs: [
        {
            title: i18next.t('page.profit_wallet.page_name', 'Dompet Profit'),
            href: '/profit-wallet',
        },
    ],
};
```

- [ ] **Step 4: Regenerate Wayfinder Route Functions**

Run: `php artisan wayfinder:generate`
Expected: PASS

- [ ] **Step 5: Run client type checking compilation**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 6: Commit**

```bash
git add resources/js/pages/profit-wallet/columns.tsx resources/js/pages/profit-wallet/data-table.tsx resources/js/pages/profit-wallet/index.tsx
git commit -m "feat(profit-wallet): implement columns, data-table, and main page for profit wallet"
```
