# Design Specification: Transaction Filter Permission Check

## Overview
Pada modul transaksi (`resources/js/pages/transaction`), pengguna dapat memfilter transaksi berdasarkan kasir (`user_id`) dan metode pembayaran (`payment_method_id`). Dokumen ini merinci penyesuaian agar sistem memeriksa izin pengguna (`read-user` dan `read-payment-method`) sebelum mengambil data master tersebut dan sebelum menampilkan komponen antarmuka dropdown filternya.

## Objectives
1. Mencegah pemanggilan endpoint API `/api/v1/user/all` jika pengguna tidak memiliki permission `read-user` (`PERMISSIONENUMS.USER.READ`).
2. Mencegah pemanggilan endpoint API `/api/v1/paymentMethod` jika pengguna tidak memiliki permission `read-payment-method` (`PERMISSIONENUMS.PAYMENT_METHOD.READ`).
3. Menyembunyikan dropdown filter kasir dan filter badge aktif kasir pada komponen `DataTable` jika pengguna tidak memiliki permission `read-user`.
4. Menyembunyikan dropdown filter metode pembayaran dan filter badge aktif metode pembayaran pada komponen `DataTable` jika pengguna tidak memiliki permission `read-payment-method`.

## Architecture & Data Flow

### 1. `resources/js/pages/transaction/index.tsx`
- **Pengecekan Izin**:
  Menggunakan hook `useAuth`:
  ```typescript
  const { hasPermission } = useAuth();
  const canReadUser = hasPermission(PERMISSIONENUMS.USER.READ);
  const canReadPaymentMethod = hasPermission(PERMISSIONENUMS.PAYMENT_METHOD.READ);
  ```
- **Conditional Initial Fetch**:
  Dalam `useEffect`, data hanya di-fetch apabila izin terpenuhi:
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
- **Passing Props ke `DataTable`**:
  `<DataTable />` menerima prop:
  - `canReadUser={canReadUser}`
  - `canReadPaymentMethod={canReadPaymentMethod}`

### 2. `resources/js/pages/transaction/data-table.tsx`
- **Extension Props Interface**:
  ```typescript
  interface DataTableProps<TData, TValue> {
      // ... existing props
      canReadUser?: boolean;
      canReadPaymentMethod?: boolean;
  }
  ```
- **Conditional UI Rendering**:
  - Dropdown Filter Kasir / Petugas hanya ditampilkan jika `canReadUser === true`.
  - Dropdown Filter Metode Pembayaran hanya ditampilkan jika `canReadPaymentMethod === true`.
  - Badge filter aktif `queryParam.user_id` hanya ditampilkan jika `canReadUser && queryParam.user_id`.
  - Badge filter aktif `queryParam.payment_method_id` hanya ditampilkan jika `canReadPaymentMethod && queryParam.payment_method_id`.

## Verification & Testing Plan
1. **Type Checking & Build**:
   Menjalankan `npm run build` atau compiler check untuk memvalidasi kelengkapan tipe TypeScript dan JSX syntax.
2. **Automated Tests**:
   Menjalankan `php artisan test --compact` untuk memastikan fungsionalitas backend dan endpoint otorisasi tetap berjalan normal.
3. **Pint Code Formatter**:
   Menjalankan `vendor/bin/pint --dirty --format agent` jika terdapat perubahan PHP.
