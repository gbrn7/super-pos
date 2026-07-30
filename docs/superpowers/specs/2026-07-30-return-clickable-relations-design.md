# Spesifikasi Desain: Hubungan Interaktif (Clickable) pada Riwayat Retur Barang

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk membuat nomor retur (No. Retur) dan nomor invoice (No. Invoice) menjadi elemen interaktif yang dapat diklik pada halaman riwayat retur barang. Menghubungkan klik ini ke masing-masing dialog detail akan mempermudah navigasi bagi kasir/petugas.

## 2. Solusi Rancangan

### 2.1 Konfigurasi Kolom Tabel
Ubah elemen statis teks pada kolom menjadi tombol interaktif (link-style).

**Berkas yang diubah:** [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/columns.tsx)
* **Perubahan:**
  * Tambahkan parameter `onInvoiceClick: (transactionId: number) => void` pada fungsi pembuat kolom.
  * Render `return_number` menggunakan tag `<button>` yang memicu `onDetailClick`.
  * Render `transaction.invoice_number` menggunakan tag `<button>` yang memicu `onInvoiceClick(row.original.transaction_id)`.

### 2.2 Halaman Utama Riwayat Retur
Integrasikan modal detail transaksi dan kelola state-nya.

**Berkas yang diubah:** [index.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/index.tsx)
* **Perubahan:**
  * Impor `DetailDialog` milik transaksi dari `../transaction/dialog-modal/detail-dialog` sebagai `TransactionDetailDialog`.
  * Tambahkan state:
    * `transactionDetailOpen`: boolean
    * `selectedTransactionId`: number | null
  * Daftarkan handler `handleInvoiceClick(transactionId)` untuk memperbarui state dan membuka dialog.
  * Render `<TransactionDetailDialog>` di bagian bawah halaman.
