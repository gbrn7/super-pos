# Design Specification: Profit Wallet Reference Column Permission Check

## Overview
Pada modul profit wallet (`resources/js/pages/profit-wallet`), pengguna dapat melihat riwayat mutasi dompet profit. Pada kolom "Rujukan" (`reference`), pengguna dapat mengklik nomor invoice transaksi untuk melihat struk atau detail transaksi. Dokumen ini merinci penyesuaian agar sistem memeriksa apakah pengguna memiliki permission `read-transaction` (`PERMISSIONENUMS.TRANSACTION.READ`). Jika tidak memiliki permission tersebut, kolom rujukan tidak akan ditampilkan di tabel mutasi dompet profit.

## Objectives
1. Memeriksa permission `read-transaction` (`PERMISSIONENUMS.TRANSACTION.READ`) pada halaman Profit Wallet.
2. Menyembunyikan kolom "Rujukan" (`reference`) dari tabel `DataTable` jika pengguna tidak memiliki permission `read-transaction`.
3. Mencegah terbukanya modal detail transaksi (`DetailDialog`) jika pengguna tidak memiliki izin baca transaksi.

## Architecture & Data Flow

### 1. `resources/js/pages/profit-wallet/index.tsx`
- **Pengecekan Izin**:
  Menggunakan hook `useAuth`:
  ```typescript
  import { useAuth } from '@/hooks/use-auth';
  // ...
  const { hasPermission } = useAuth();
  const canReadTransaction = hasPermission(PERMISSIONENUMS.TRANSACTION.READ);
  ```
- **Passing ke Columns**:
  ```typescript
  columns={columns({
      onInvoiceClick: handleInvoiceClick,
      onSortChange: () => {},
      orderBy: 'id',
      order: 'desc',
      canReadTransaction,
  })}
  ```
- **Guard Detail Modal**:
  ```tsx
  {canReadTransaction && selectedTransaction && (
      <DetailDialog
          isOpen={detailOpen}
          transaction={selectedTransaction}
          onOpenChange={setDetailOpen}
          storeSetting={storeSetting}
      />
  )}
  ```

### 2. `resources/js/pages/profit-wallet/columns.tsx`
- **Extension Props Interface**:
  ```typescript
  interface ColumnProps {
      onInvoiceClick: (invoiceNumber: string) => void;
      onSortChange: (orderBy: string | null, order: string | null) => void;
      orderBy?: string;
      order?: string;
      canReadTransaction?: boolean;
  }
  ```
- **Conditional Column Inclusion**:
  Kolom `reference` hanya disertakan di dalam array `ColumnDef` apabila `canReadTransaction === true`.

## Verification & Testing Plan
1. **Type Checking & Build**:
   Menjalankan `npm run build` untuk memverifikasi kelengkapan tipe TypeScript dan JSX syntax.
2. **Automated Tests**:
   Menjalankan `php artisan test tests/Feature/ProfitWallet/ --compact` untuk memastikan fungsionalitas profit wallet tetap normal.
3. **Pint Code Formatter**:
   Memastikan format PHP dengan `vendor/bin/pint --dirty --format agent`.
