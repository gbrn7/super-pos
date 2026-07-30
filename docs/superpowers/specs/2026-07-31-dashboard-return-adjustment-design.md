# Spesifikasi Desain: Penyesuaian Data Dashboard dengan Retur Barang

## 1. Latar Belakang & Tujuan
Saat ini, modul retur barang (`returns` & `return_details`) sudah diimplementasikan di aplikasi POS ini. Namun, data pada dashboard (`ApiDashboardController` / `DashboardRepository`) masih dihitung secara kotor langsung dari tabel `transactions` dan `transaction_detail` tanpa mengurangi barang yang dikembalikan.

Tujuan dari perubahan ini adalah memastikan semua metrik di dashboard (Total Revenue, Laba Bersih, Jumlah Barang Terjual, Grafik Tren, Produk Terlaris, dan Breakdown per Kategori/Metode Pembayaran) secara akurat mencerminkan pengurangan dari barang yang diretur.

---

## 2. Prinsip Desain
- **Audit Trail Terjaga**: Kita tidak mengubah/menghapus data transaksi asal secara destruktif. Semua pengurangan dilakukan secara dinamis pada saat query dashboard dijalankan.
- **Berdasarkan Waktu Retur (Opsi B)**: Data retur memengaruhi laporan pada tanggal retur tersebut dibuat (`returns.created_at`), bukan tanggal transaksi asal. Ini memastikan laporan keuangan historis yang sudah lewat (tutup buku) tidak berubah secara retrospektif.
- **Konsistensi Metrik**: Pengurangan retur diaplikasikan secara konsisten di metrik ringkasan, grafik tren, serta daftar produk terlaris dan breakdown.

---

## 3. Rencana Perubahan Detail

### A. Modifikasi `DashboardRepository` (`app/Repositories/DashboardRepository.php`)

#### 1. Metrik Ringkasan (`getMetrics`)
Mengurangi metrik transaksi kotor dengan agregat retur pada rentang tanggal:
- **Total Revenue**: `SUM(transactions.total_amount) - SUM(returns.total_refund_amount)`.
- **Total Cost (HPP)**: `SUM(transaction_detail.quantity * transaction_detail.cost_price) - SUM(return_details.quantity * transaction_detail.cost_price)`.
- **Products Sold**: `SUM(transaction_detail.quantity) - SUM(return_details.quantity)`.
- **Total Net Profit**: `Total Revenue - Total Cost`.

#### 2. Grafik Tren (`getTrendChart`)
Mengelompokkan data retur harian dan menguranginya dari penjualan harian:
- Query harian transaksi digabungkan dengan query harian retur berdasarkan tanggal kejadian (`to_char(to_timestamp(created_at), 'YYYY-MM-DD')`).
- Hasil akhir harian dikurangi di tingkat database atau PHP sebelum dikembalikan ke service.

#### 3. Produk Terlaris (`getTopProducts` & `best_sellers`)
- Melakukan query jumlah barang terjual kotor per produk, dikurangi dengan total kuantitas barang tersebut yang diretur pada rentang tanggal yang dipilih.

#### 4. Breakdown Metode Pembayaran (`getTransactionsByPaymentMethod`)
- Mengurangi total nominal transaksi per metode pembayaran dengan total refund dari retur yang terkait dengan transaksi metode pembayaran tersebut.

#### 5. Breakdown Kategori (`getTransactionsByCategory`)
- Mengurangi kuantitas barang terjual dan subtotal per kategori dengan kuantitas dan subtotal dari return details dalam rentang tanggal.

---

## 4. Rencana Pengujian (Testing)
- Membuat unit/feature test baru untuk memastikan:
  1. Transaksi tanpa retur mengembalikan metrik normal.
  2. Transaksi dengan retur mengurangi metrik dashboard secara akurat.
  3. Grafik tren harian mencerminkan pengurangan pada tanggal retur dilakukan.
  4. Produk terlaris dan breakdown kategori/metode pembayaran berkurang sesuai kuantitas retur.
