# Design Specification: Product Filter Permission Check

## Overview
Pada modul produk (`resources/js/pages/product`), pengguna dapat memfilter produk berdasarkan kategori (`category_id`) dan satuan (`unit_id`). Dokumen ini merinci penyesuaian agar sistem memeriksa izin pengguna (`read-category` dan `read-unit`) sebelum mengambil data master kategori dan satuan dari API serta sebelum merender komponen dropdown filternya.

## Objectives
1. Mencegah pemanggilan endpoint API kategori (`apiGetCategories`) jika pengguna tidak memiliki permission `read-category` (`PERMISSIONENUMS.CATEGORY.READ`).
2. Mencegah pemanggilan endpoint API satuan (`apiGetUnits`) jika pengguna tidak memiliki permission `read-unit` (`PERMISSIONENUMS.UNIT.READ`).
3. Menyembunyikan dropdown filter kategori dan active filter badge kategori pada `DataTable` produk jika pengguna tidak memiliki permission `read-category`.
4. Menyembunyikan dropdown filter satuan dan active filter badge satuan pada `DataTable` produk jika pengguna tidak memiliki permission `read-unit`.

## Architecture & Data Flow

### 1. `resources/js/pages/product/index.tsx`
- **Pengecekan Izin**:
  Menggunakan hook `useAuth`:
  ```typescript
  const { hasPermission } = useAuth();
  const canReadCategory = hasPermission(PERMISSIONENUMS.CATEGORY.READ);
  const canReadUnit = hasPermission(PERMISSIONENUMS.UNIT.READ);
  ```
- **Conditional Initial Fetch**:
  Di dalam `useEffect`:
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
- **Passing Props ke `DataTable`**:
  `<DataTable />` menerima prop:
  - `canReadCategory={canReadCategory}`
  - `canReadUnit={canReadUnit}`

### 2. `resources/js/pages/product/data-table.tsx`
- **Extension Props Interface**:
  ```typescript
  interface DataTableProps<TData, TValue> {
      // ... existing props
      canReadCategory?: boolean;
      canReadUnit?: boolean;
  }
  ```
- **Conditional UI Rendering**:
  - Dropdown Filter Kategori hanya ditampilkan jika `canReadCategory === true`.
  - Dropdown Filter Satuan hanya ditampilkan jika `canReadUnit === true`.
  - Badge filter aktif `queryParam.category_id` hanya ditampilkan jika `canReadCategory && queryParam.category_id`.
  - Badge filter aktif `queryParam.unit_id` hanya ditampilkan jika `canReadUnit && queryParam.unit_id`.

## Verification & Testing Plan
1. **Type Checking & Build**:
   Menjalankan `npm run build` untuk memvalidasi kelengkapan tipe TypeScript dan JSX syntax.
2. **Automated Tests**:
   Menjalankan `php artisan test tests/Feature/Product/ --compact` untuk memastikan fungsionalitas produk dan endpoint otorisasi tetap berjalan normal.
3. **Pint Code Formatter**:
   Menjalankan `vendor/bin/pint --dirty --format agent` jika terdapat perubahan file PHP.
