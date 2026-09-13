# Transaction Filter Permission Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan pengecekan izin akses (`read-user` dan `read-payment-method`) pada modul transaksi sebelum melakukan fetching data dan menampilkan dropdown filter kasir serta metode pembayaran.

**Architecture:** Modul transaksi menggunakan arsitektur container-presentational di mana `resources/js/pages/transaction/index.tsx` memverifikasi permission via `useAuth().hasPermission()`, melakukan conditional API fetch data master (`users` dan `paymentMethods`), kemudian meneruskan status permission ke `resources/js/pages/transaction/data-table.tsx` via props untuk conditional rendering.

**Tech Stack:** Laravel 12, Inertia.js React v3, TypeScript, Tailwind CSS v4, Lucide React, Pest PHP.

## Global Constraints
- Laravel 12 streamlined structure.
- Menggunakan `PERMISSIONENUMS.USER.READ` (`read-user`) dan `PERMISSIONENUMS.PAYMENT_METHOD.READ` (`read-payment-method`).
- Tidak boleh mengubah behaviour filter lainnya (tanggal, keyword, sorting).
- Menjaga konvensi code style project (Pint untuk PHP, ESLint/Prettier untuk TSX).

---

### Task 1: Update `DataTable` Component Props and Conditional Rendering

**Files:**
- Modify: `resources/js/pages/transaction/data-table.tsx`

**Interfaces:**
- Consumes:
  - `canReadUser?: boolean`
  - `canReadPaymentMethod?: boolean`
- Produces:
  - `DataTable` renders cashier filter only if `canReadUser === true` (default `false` or `true` depending on prop).
  - `DataTable` renders payment method filter only if `canReadPaymentMethod === true`.
  - Active filter badges only render cashier/payment method filter if respective permission prop is true.

- [ ] **Step 1: Extend `DataTableProps` interface in `resources/js/pages/transaction/data-table.tsx`**

Tambahkan properti opsional `canReadUser` dan `canReadPaymentMethod` pada interface `DataTableProps`:
```typescript
interface DataTableProps<TData, TValue> {
    columns:
        | ColumnDef<TData, TValue>[]
        | ((props: any) => ColumnDef<TData, TValue>[]);
    data: TData[];
    paymentMethods?: PaymentMethod[];
    users?: User[];
    processing?: boolean;
    limitOptions?: number[];
    onRefresh: () => void;
    detailDataOpen: boolean;
    setDetailOpen: (open: boolean) => void;
    onDetailClick: (data: TData) => void;
    onReturnClick?: (data: TData) => void;
    selectedTransaction: Transaction | null;
    queryParam: TransactionQueryParam;
    pagination: Pagination;
    onQueryParamChange?: <K extends keyof TransactionQueryParam>(
        key: K,
        value: TransactionQueryParam[K],
    ) => void;
    onResetFilter?: () => void;
    onChangePaginationPage: (page: number) => void;
    onChangePaginationLimit: (limit: number) => void;
    onChangeField: (field: string) => void;
    onChangeUser?: (userId: number | null) => void;
    onChangePaymentMethod?: (paymentMethodId: number | null) => void;
    onChangeKeyword: (keyword: string) => void;
    onChangeStartDate: (date: number | null) => void;
    onChangeEndDate: (date: number | null) => void;
    setQueryParam: React.Dispatch<React.SetStateAction<TransactionQueryParam>>;
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    storeSetting?: StoreSetting | null;
    canReadUser?: boolean;
    canReadPaymentMethod?: boolean;
}
```

- [ ] **Step 2: Destructure `canReadUser` and `canReadPaymentMethod` in `DataTable` component**

Destruktur prop dengan default value `false`:
```typescript
export function DataTable<TData, TValue>({
    columns: columnsOrFn,
    data,
    paymentMethods = [],
    users = [],
    processing,
    limitOptions = [10, 20, 50, 100],
    detailDataOpen,
    setDetailOpen,
    onDetailClick,
    onReturnClick,
    selectedTransaction,
    queryParam,
    pagination,
    onResetFilter,
    onChangePaginationPage,
    onChangePaginationLimit,
    onChangeField,
    onChangeUser,
    onChangePaymentMethod,
    onChangeKeyword,
    onChangeStartDate,
    onChangeEndDate,
    setQueryParam,
    rowSelection,
    setRowSelection,
    storeSetting,
    canReadUser = false,
    canReadPaymentMethod = false,
}: DataTableProps<TData, TValue>) {
```

- [ ] **Step 3: Wrap Cashier and Payment Method Filter Dropdowns with Permission Flags**

Ubah bagian filter pada grid:
```tsx
                    {/* Cashier / User Filter */}
                    {canReadUser && (
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <UserIcon className="h-4 w-4" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.cashier_label',
                                    'Kasir / Petugas',
                                )}
                            </Label>
                            <Select
                                value={
                                    queryParam.user_id
                                        ? String(queryParam.user_id)
                                        : 'all'
                                }
                                onValueChange={(value) => {
                                    if (onChangeUser) {
                                        onChangeUser(
                                            value === 'all' ? null : Number(value),
                                        );
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={t(
                                            'component.data_table.all_cashiers',
                                            'Semua Kasir',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t(
                                            'component.data_table.all_cashiers',
                                            'Semua Kasir',
                                        )}
                                    </SelectItem>
                                    {users?.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Payment Method Filter */}
                    {canReadPaymentMethod && (
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                {t(
                                    'page.transaction.dialog_modal.detail_dialog.payment_method_label',
                                    'Metode Pembayaran',
                                )}
                            </Label>
                            <Select
                                value={
                                    queryParam.payment_method_id
                                        ? String(queryParam.payment_method_id)
                                        : 'all'
                                }
                                onValueChange={(value) => {
                                    if (onChangePaymentMethod) {
                                        onChangePaymentMethod(
                                            value === 'all' ? null : Number(value),
                                        );
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={t(
                                            'component.data_table.all_payment_methods',
                                            'Semua Metode Pembayaran',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t(
                                            'component.data_table.all_payment_methods',
                                            'Semua Metode Pembayaran',
                                        )}
                                    </SelectItem>
                                    {paymentMethods?.map((pm) => (
                                        <SelectItem
                                            key={pm.id}
                                            value={String(pm.id)}
                                        >
                                            {pm.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
```

- [ ] **Step 4: Conditionally Render Active Filter Badges**

Di bagian `Active Filter Badges`:
```tsx
                            {canReadUser && queryParam.user_id && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'page.transaction.dialog_modal.detail_dialog.cashier_label',
                                            'Kasir',
                                        )}
                                        :{' '}
                                        {users?.find(
                                            (u) => u.id === queryParam.user_id,
                                        )?.name || queryParam.user_id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChangeUser && onChangeUser(null)
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter kasir
                                        </span>
                                    </button>
                                </Badge>
                            )}

                            {canReadPaymentMethod && queryParam.payment_method_id && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'page.transaction.dialog_modal.detail_dialog.payment_method_label',
                                            'Metode Pembayaran',
                                        )}
                                        :{' '}
                                        {paymentMethods?.find(
                                            (pm) =>
                                                pm.id ===
                                                queryParam.payment_method_id,
                                        )?.name || queryParam.payment_method_id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChangePaymentMethod &&
                                            onChangePaymentMethod(null)
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter metode pembayaran
                                        </span>
                                    </button>
                                </Badge>
                            )}
```

- [ ] **Step 5: Commit changes in `data-table.tsx`**

```bash
git add resources/js/pages/transaction/data-table.tsx
git commit -m "feat(transaction): add canReadUser and canReadPaymentMethod conditional checks in DataTable"
```

---

### Task 2: Implement Permission Checking and Conditional Data Fetching in `Index`

**Files:**
- Modify: `resources/js/pages/transaction/index.tsx`

**Interfaces:**
- Consumes:
  - `useAuth().hasPermission`
  - `PERMISSIONENUMS.USER.READ`
  - `PERMISSIONENUMS.PAYMENT_METHOD.READ`
- Produces:
  - `canReadUser` boolean
  - `canReadPaymentMethod` boolean
  - Fetches users only when `canReadUser` is true
  - Fetches payment methods only when `canReadPaymentMethod` is true
  - Passes `canReadUser` and `canReadPaymentMethod` to `<DataTable />`

- [ ] **Step 1: Check permissions in `resources/js/pages/transaction/index.tsx`**

Periksa permission dengan `hasPermission`:
```typescript
    const canReadUser = hasPermission(PERMISSIONENUMS.USER.READ);
    const canReadPaymentMethod = hasPermission(PERMISSIONENUMS.PAYMENT_METHOD.READ);
```

- [ ] **Step 2: Update initial `useEffect` to fetch conditionally**

Perbarui pemanggilan data master:
```typescript
    useEffect(() => {
        const promises: Promise<void>[] = [];
        if (canReadPaymentMethod) {
            promises.push(fetchPaymentMethods());
        }
        if (canReadUser) {
            promises.push(fetchUsers());
        }
        if (promises.length > 0) {
            void Promise.all(promises);
        }
    }, [canReadPaymentMethod, canReadUser]);
```

- [ ] **Step 3: Pass `canReadUser` and `canReadPaymentMethod` to `<DataTable />`**

Di JSX `<DataTable />`:
```tsx
                <DataTable
                    columns={columns}
                    paymentMethods={paymentMethods}
                    users={users}
                    canReadUser={canReadUser}
                    canReadPaymentMethod={canReadPaymentMethod}
                    processing={processing}
                    ...
```

- [ ] **Step 4: Commit changes in `index.tsx`**

```bash
git add resources/js/pages/transaction/index.tsx
git commit -m "feat(transaction): check read-user and read-payment-method permissions before fetching and rendering filters"
```

---

### Task 3: Build Verification & Test Suite Execution

**Files:**
- None (Build & Test verification)

- [ ] **Step 1: Run TypeScript and frontend build check**

Jalankan build Vite untuk memastikan tidak ada kesalahan tipe TypeScript atau JSX:
```bash
npm run build
```
Expected: Build sukses tanpa error kompilasi TS/Vite.

- [ ] **Step 2: Run backend test suite**

Jalankan test suite backend untuk memastikan endpoint dan otorisasi tetap aman:
```bash
php artisan test --compact
```
Expected: Semua test lolos.
