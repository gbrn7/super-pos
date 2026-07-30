# Spesifikasi Desain: Tab Barang Diretur pada Detail Transaksi

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk menambahkan tab baru bernama "Barang Diretur" pada modal detail transaksi. Fitur ini bertujuan agar pengguna/kasir dapat melihat informasi barang apa saja yang telah dikembalikan (diretur) dari transaksi tersebut beserta alasannya tanpa harus membuka menu riwayat retur secara terpisah.

## 2. Solusi Rancangan

### 2.1 Ekspor Data Retur pada API Resource Transaksi
Mengekspos data koleksi retur dari transaksi.

**Berkas yang diubah:** [TransactionResource.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Resources/TransactionResource.php)
* **Perubahan:**
  * Impor `App\Http\Resources\ProductReturnResource`.
  * Tambahkan `'returns' => ProductReturnResource::collection($this->whenLoaded('returns'))` ke dalam array response.

### 2.2 Antarmuka Pengguna Frontend (Tabs)
Tambahkan tab baru "Barang Diretur" pada komponen `DetailDialog`.

**Berkas yang diubah:** [detail-dialog.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/transaction/dialog-modal/detail-dialog.tsx)
* **Perubahan:**
  * Tambahkan `<TabsTrigger value="returns">` pada list TabsList.
  * Tambahkan `<TabsContent value="returns">` yang merender tabel berisi produk-produk yang di-retur, kuantitasnya, subtotal refund, alasan retur, serta tanggal pengembalian.
  * Tampilkan pesan placeholder yang ramah jika data retur kosong.
