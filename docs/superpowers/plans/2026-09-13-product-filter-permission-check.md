# Product Filter Permission Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan pengecekan izin akses (`read-category` dan `read-unit`) pada modul produk sebelum melakukan fetching data master dan menampilkan dropdown filter kategori serta satuan.

**Architecture:** Modul produk menggunakan arsitektur container-presentational di mana `resources/js/pages/product/index.tsx` memeriksa permission via `useAuth().hasPermission()`, melakukan conditional API fetch untuk `categories` dan `units`, lalu meneruskan boolean permission flags ke `resources/js/pages/product/data-table.tsx` untuk conditional rendering.

**Tech Stack:** Laravel 12, Inertia.js React v3, TypeScript, Tailwind CSS v4, Lucide React, Pest PHP.

## Global Constraints
- Menggunakan `PERMISSIONENUMS.CATEGORY.READ` (`read-category`) dan `PERMISSIONENUMS.UNIT.READ` (`read-unit`).
- Tidak mengubah behaviour filter lainnya (status stok, status aktif, tipe stok, keyword, barcode, pagination).
- Menjaga konvensi code style project (Pint untuk PHP, ESLint/Prettier untuk TSX).

---

### Task 1: Update `DataTable` Component Props and Conditional Rendering in Product Module

**Files:**
- Modify: `resources/js/pages/product/data-table.tsx`

**Interfaces:**
- Consumes:
  - `canReadCategory?: boolean`
  - `canReadUnit?: boolean`
- Produces:
  - `DataTable` renders category filter only if `canReadCategory === true`.
  - `DataTable` renders unit filter only if `canReadUnit === true`.
  - Active filter badges only render category/unit filter if respective permission prop is true.

- [ ] **Step 1: Extend `DataTableProps` interface in `resources/js/pages/product/data-table.tsx`**

Tambahkan properti opsional `canReadCategory` dan `canReadUnit` pada interface `DataTableProps`:
```typescript
interface DataTableProps<TData, TValue> {
    // ...
    canReadCategory?: boolean;
    canReadUnit?: boolean;
}
```

- [ ] **Step 2: Destructure `canReadCategory` and `canReadUnit` in `DataTable` component**

Destruktur prop dengan default value `false`:
```typescript
export function DataTable<TData, TValue>({
    columns: columnsOrFn,
    data,
    categories,
    units,
    // ...
    canReadCategory = false,
    canReadUnit = false,
}: DataTableProps<TData, TValue>) {
```

- [ ] **Step 3: Wrap Category and Unit Filter Dropdowns with Permission Flags**

Ubah bagian filter kategori dan satuan di JSX:
```tsx
                    {canReadCategory && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'component.data_table.filter.category_label',
                                    'Kategori',
                                )}
                            </Label>
                            <SearchableSelect
                                options={categoryFilterOptions}
                                value={getNumberFilterValue(queryParam.category_id)}
                                onValueChange={(value) =>
                                    updateQueryParam(
                                        'category_id',
                                        getNullableNumberFilterValue(value),
                                    )
                                }
                                placeholder={t(
                                    'component.data_table.filter.category_placeholder',
                                    'Pilih Kategori',
                                )}
                                searchPlaceholder={t(
                                    'component.data_table.filter.search_category_placeholder',
                                    'Cari Kategori...',
                                )}
                                emptyMessage={t(
                                    'component.data_table.filter.no_category_found',
                                    'Kategori tidak ditemukan.',
                                )}
                            />
                        </div>
                    )}
                    {canReadUnit && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-muted-foreground">
                                {t(
                                    'component.data_table.filter.unit_label',
                                    'Satuan',
                                )}
                            </Label>
                            <SearchableSelect
                                options={unitFilterOptions}
                                value={getNumberFilterValue(queryParam.unit_id)}
                                onValueChange={(value) =>
                                    updateQueryParam(
                                        'unit_id',
                                        getNullableNumberFilterValue(value),
                                    )
                                }
                                placeholder={t(
                                    'component.data_table.filter.unit_placeholder',
                                    'Pilih Satuan',
                                )}
                                searchPlaceholder={t(
                                    'component.data_table.filter.search_unit_placeholder',
                                    'Cari Satuan...',
                                )}
                                emptyMessage={t(
                                    'component.data_table.filter.no_unit_found',
                                    'Satuan tidak ditemukan.',
                                )}
                            />
                        </div>
                    )}
```

- [ ] **Step 4: Conditionally Render Active Filter Badges**

Perbarui rendering active filter badges untuk kategori dan satuan:
```tsx
                            {canReadCategory && queryParam.category_id && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'component.data_table.filter.category_label',
                                            'Kategori',
                                        )}
                                        :{' '}
                                        {categories.find(
                                            (c) =>
                                                c.id === queryParam.category_id,
                                        )?.name || queryParam.category_id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQueryParam(
                                                'category_id',
                                                null,
                                            )
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter kategori
                                        </span>
                                    </button>
                                </Badge>
                            )}

                            {canReadUnit && queryParam.unit_id && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 bg-muted/50 px-2 py-0.5 text-xs font-normal hover:bg-muted"
                                >
                                    <span>
                                        {t(
                                            'component.data_table.filter.unit_label',
                                            'Satuan',
                                        )}
                                        :{' '}
                                        {units.find(
                                            (u) => u.id === queryParam.unit_id,
                                        )?.name || queryParam.unit_id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQueryParam('unit_id', null)
                                        }
                                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                            Hapus filter satuan
                                        </span>
                                    </button>
                                </Badge>
                            )}
```

- [ ] **Step 5: Commit changes in `product/data-table.tsx`**

```bash
git add resources/js/pages/product/data-table.tsx
git commit -m "feat(product): add canReadCategory and canReadUnit conditional checks in DataTable"
```

---

### Task 2: Implement Permission Checking and Conditional Data Fetching in `Product Index`

**Files:**
- Modify: `resources/js/pages/product/index.tsx`

**Interfaces:**
- Consumes:
  - `useAuth().hasPermission`
  - `PERMISSIONENUMS.CATEGORY.READ`
  - `PERMISSIONENUMS.UNIT.READ`
- Produces:
  - `canReadCategory` boolean
  - `canReadUnit` boolean
  - Fetches categories only when `canReadCategory` is true
  - Fetches units only when `canReadUnit` is true
  - Passes `canReadCategory` and `canReadUnit` to `<DataTable />`

- [ ] **Step 1: Check permissions in `resources/js/pages/product/index.tsx`**

Import `useAuth` dan `PERMISSIONENUMS`:
```typescript
import { useAuth } from '@/hooks/use-auth';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';
```
Dan di dalam komponen `Index`:
```typescript
    const { hasPermission } = useAuth();
    const canReadCategory = hasPermission(PERMISSIONENUMS.CATEGORY.READ);
    const canReadUnit = hasPermission(PERMISSIONENUMS.UNIT.READ);
```

- [ ] **Step 2: Update initial `useEffect` to fetch conditionally**

```typescript
    useEffect(() => {
        const promises: Promise<void>[] = [];

        if (canReadCategory) {
            promises.push(fetchCategories());
        }

        if (canReadUnit) {
            promises.push(fetchUnits());
        }

        if (promises.length > 0) {
            void Promise.all(promises);
        }
    }, [canReadCategory, canReadUnit]);
```

- [ ] **Step 3: Pass `canReadCategory` and `canReadUnit` to `<DataTable />`**

```tsx
                <DataTable
                    columns={columns}
                    categories={categories}
                    units={units}
                    canReadCategory={canReadCategory}
                    canReadUnit={canReadUnit}
                    processing={processing}
                    // ...
```

- [ ] **Step 4: Commit changes in `product/index.tsx`**

```bash
git add resources/js/pages/product/index.tsx
git commit -m "feat(product): check read-category and read-unit permissions before fetching and rendering filters"
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

- [ ] **Step 2: Run backend product test suite**

```bash
php artisan test tests/Feature/Product/ --compact
```
Expected: Semua test produk lolos.
