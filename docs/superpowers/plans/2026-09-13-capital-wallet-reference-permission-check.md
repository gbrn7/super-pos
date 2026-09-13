# Capital Wallet Reference Column Permission Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyembunyikan kolom "Rujukan" (`reference`) pada tabel Dompet Modal (Capital Wallet) jika pengguna tidak memiliki permission `read-transaction` (`PERMISSIONENUMS.TRANSACTION.READ`).

**Architecture:** Modul capital wallet mendefinisikan kolom tabel di `resources/js/pages/capital-wallet/columns.tsx`. Di `resources/js/pages/capital-wallet/index.tsx`, kita memeriksa izin menggunakan `useAuth().hasPermission(PERMISSIONENUMS.TRANSACTION.READ)` dan meneruskan boolean flag `canReadTransaction` ke fungsi pembentuk kolom `columns(...)`. Jika `canReadTransaction` bernilai `false`, kolom `reference` tidak disertakan di dalam array `ColumnDef`.

**Tech Stack:** Laravel 12, Inertia.js React v3, TypeScript, Tailwind CSS v4, TanStack Table v8, Lucide React, Pest PHP.

## Global Constraints
- Menggunakan `PERMISSIONENUMS.TRANSACTION.READ` (`read-transaction`).
- Tidak mengubah kolom lainnya (waktu mutasi, jenis transaksi, arah aliran, jumlah, saldo awal, saldo akhir, catatan).
- Menjaga konvensi code style project (Pint untuk PHP, ESLint/Prettier untuk TSX).

---

### Task 1: Update `ColumnProps` and Conditionally Include `reference` Column in `columns.tsx`

**Files:**
- Modify: `resources/js/pages/capital-wallet/columns.tsx`

**Interfaces:**
- Consumes:
  - `canReadTransaction?: boolean`
- Produces:
  - `columns` returns `reference` column only if `canReadTransaction === true`.

- [ ] **Step 1: Extend `ColumnProps` interface in `resources/js/pages/capital-wallet/columns.tsx`**

Tambahkan properti opsional `canReadTransaction?: boolean`:
```typescript
interface ColumnProps {
    onInvoiceClick: (invoiceNumber: string) => void;
    onSortChange: (orderBy: string | null, order: string | null) => void;
    orderBy?: string;
    order?: string;
    canReadTransaction?: boolean;
}
```

- [ ] **Step 2: Update `columns` function to conditionally include the `reference` column**

Destruktur `canReadTransaction = false` dan gunakan conditional spread:
```typescript
export const columns = ({
    onInvoiceClick,
    onSortChange,
    orderBy,
    order,
    canReadTransaction = false,
}: ColumnProps): ColumnDef<CapitalWalletTransaction>[] => [
    // ... kolom-kolom sebelumnya
    ...(canReadTransaction
        ? [
                {
                    accessorKey: 'reference',
                    header: () =>
                        i18next.t(
                            'page.capital_wallet.data_table.columns.reference',
                            'Rujukan',
                        ),
                    cell: ({ row }: any) => {
                        const inv = row.original.invoice_number;
                        if (!inv || inv === '-') return <span>-</span>;
                        return (
                            <button
                                onClick={() => onInvoiceClick(inv)}
                                className="cursor-pointer text-left font-medium text-primary hover:underline"
                            >
                                {inv}
                            </button>
                        );
                    },
                } as ColumnDef<CapitalWalletTransaction>,
            ]
          : []),
];
```

- [ ] **Step 3: Commit changes in `capital-wallet/columns.tsx`**

```bash
git add resources/js/pages/capital-wallet/columns.tsx
git commit -m "feat(capital-wallet): conditionally include reference column based on canReadTransaction"
```

---

### Task 2: Implement Permission Checking and Pass to Columns in `Capital Wallet Index`

**Files:**
- Modify: `resources/js/pages/capital-wallet/index.tsx`

**Interfaces:**
- Consumes:
  - `useAuth().hasPermission`
  - `PERMISSIONENUMS.TRANSACTION.READ`
- Produces:
  - `canReadTransaction` boolean
  - Passes `canReadTransaction` to `columns({...})`
  - Guards `<DetailDialog />` with `canReadTransaction`

- [ ] **Step 1: Import `useAuth` and evaluate `canReadTransaction` in `capital-wallet/index.tsx`**

Tambahkan import `useAuth`:
```typescript
import { useAuth } from '@/hooks/use-auth';
```
Dan di dalam fungsi komponen `CapitalWalletIndex`:
```typescript
    const { hasPermission } = useAuth();
    const canReadTransaction = hasPermission(PERMISSIONENUMS.TRANSACTION.READ);
```

- [ ] **Step 2: Pass `canReadTransaction` to `columns()` call**

Perbarui pemanggilan `columns(...)`:
```typescript
                <DataTable
                    columns={columns({
                        onInvoiceClick: handleInvoiceClick,
                        onSortChange: () => {},
                        orderBy: 'id',
                        order: 'desc',
                        canReadTransaction,
                    })}
                    // ...
```

- [ ] **Step 3: Guard `DetailDialog` rendering**

Pastikan modal struk transaksi hanya dirender bila user berhak:
```tsx
                {/* Struk / Detail Transaction Modal */}
                {canReadTransaction && selectedTransaction && (
                    <DetailDialog
                        isOpen={detailOpen}
                        transaction={selectedTransaction}
                        onOpenChange={setDetailOpen}
                        storeSetting={storeSetting}
                    />
                )}
```

- [ ] **Step 4: Commit changes in `capital-wallet/index.tsx`**

```bash
git add resources/js/pages/capital-wallet/index.tsx
git commit -m "feat(capital-wallet): check read-transaction permission before rendering reference column and detail dialog"
```

---

### Task 3: Build Verification & Test Suite Execution

**Files:**
- None (Build & Test verification)

- [ ] **Step 1: Run TypeScript and frontend build check**

```bash
npm run build
```
Expected: Build sukses tanpa error kompilasi TS/Vite.

- [ ] **Step 2: Run backend capital wallet test suite**

```bash
php artisan test tests/Feature/CapitalWallet/ --compact
```
Expected: Semua test capital wallet lolos.
