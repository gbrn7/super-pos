# Spesifikasi Desain: Fitur Laporan Profit Transaksi

Dokumen ini mendefinisikan desain teknis untuk menambahkan fitur Laporan Profit di sistem Super POS, menggunakan tabel database khusus baru untuk menyimpan keuntungan transaksi secara eksplisit.

## 1. Latar Belakang & Tujuan
Saat ini, sistem Super POS memiliki pencatatan harga beli (`cost_price`) dan harga jual (`price`) per item, namun tidak memiliki penyimpanan atau tampilan khusus yang merangkum keuntungan bersih (profit) per transaksi. Fitur ini bertujuan untuk:
- Menyediakan tabel database khusus `transaction_profits` untuk menyimpan data pendapatan, modal, dan profit transaksi secara terpusat dan berkinerja tinggi.
- Menampilkan halaman "Laporan Profit" khusus dengan kartu ringkasan visual premium (Total Pendapatan, Total Modal/HPP, Total Laba Bersih) dan tabel transaksi lengkap dengan filter tanggal, kasir, dan metode pembayaran.
- Menjaga kerahasiaan data dengan membatasi akses fitur ini hanya untuk peran **Super Admin** dan **Admin**.

## 2. Arsitektur Database & Model

### A. Tabel Baru: `transaction_profits`
Tabel ini akan menyimpan rangkuman keuntungan untuk setiap transaksi. Jika transaksi dihapus, data profit terkait akan terhapus secara otomatis (`onDelete('cascade')`).

| Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInt (PK, Auto Increment) | ID unik record profit |
| `transaction_id` | Foreign Key (Constrained `transactions.id`, Cascade) | Hubungan ke transaksi terkait |
| `total_revenue` | Decimal (10, 2) | Total pendapatan transaksi setelah diskon |
| `total_cost` | Decimal (10, 2) | Total harga pokok penjualan (HPP) / modal barang |
| `profit` | Decimal (10, 2) | Keuntungan bersih (`total_revenue` - `total_cost`) |
| `created_at` | Timestamp | Waktu pembuatan |
| `updated_at` | Timestamp | Waktu pembaruan |

### B. Model Eloquent Baru: `App\Models\TransactionProfit`
Model ini akan mewakili tabel `transaction_profits` dengan relasi:
- `belongsTo(Transaction::class)`

Di model `App\Models\Transaction.php`, tambahkan relasi:
- `hasOne(TransactionProfit::class)`

---

## 3. Desain Backend (Alur Logika & API)

### A. Hak Akses & Keamanan (Permissions)
1. **Enum Permission Baru**: 
   - Tambahkan `READ_TRANSACTION_PROFIT = 'read-transaction-profit'` di [[TransactionPermissionEnums.php](file:///home/raygbrn/project/laravel/super-pos/app/Support/Enums/TransactionPermissionEnums.php)].
2. **Seeder**: 
   - Perbarui [[PermissionSeeder.php](file:///home/raygbrn/project/laravel/super-pos/database/seeders/PermissionSeeder.php)] untuk mendaftarkan permission baru tersebut dan memetakan hak akses ke peran `Admin`. (Super Admin mendapatkan bypass otomatis).
3. **Frontend Enum**:
   - Tambahkan `read-transaction-profit` di [[PermissionEnums.ts](file:///home/raygbrn/project/laravel/super-pos/resources/js/support/enums/PermissionEnums.ts)].

### B. Integrasi Checkout (`TransactionService`)
Pembaruan alur checkout pada metode `checkout()` di [[TransactionService.php](file:///home/raygbrn/project/laravel/super-pos/app/Services/TransactionService.php)]:
1. Selama iterasi item transaksi, sistem menghitung total HPP:
   $$\text{total\_cost} = \sum (\text{cost\_price} \times \text{quantity})$$
2. Setelah transaksi disimpan di tabel `transactions`, sistem akan menyimpan data ringkasan ke tabel `transaction_profits`:
   ```php
   $transaction->transactionProfit()->create([
       'total_revenue' => $totalAmount,
       'total_cost' => $totalCost,
       'profit' => $totalAmount - $totalCost,
   ]);
   ```

### C. Migrasi Data Historis
Di dalam file migrasi `create_transaction_profits_table`, buat kode di method `up()` untuk menghitung dan mengisi secara otomatis data profit untuk semua transaksi yang sudah ada di database saat ini:
```php
// Di dalam migration up() setelah Schema::create
$transactions = DB::table('transactions')->get();
foreach ($transactions as $tx) {
    $totalCost = DB::table('transaction_detail')
        ->where('transaction_id', $tx->id)
        ->sum(DB::raw('cost_price * quantity'));
    
    DB::table('transaction_profits')->insert([
        'transaction_id' => $tx->id,
        'total_revenue' => $tx->total_amount,
        'total_cost' => $totalCost,
        'profit' => $tx->total_amount - $totalCost,
        'created_at' => $tx->created_at,
        'updated_at' => $tx->updated_at,
    ]);
}
```

### D. API Laporan Profit & Query
Membuat controller API baru `App\Http\Controllers\Api\ApiProfitReportController.php` dengan rincian:
- **Route**: `GET /api/profit-report` (name: `apiProfitReport.index`)
- **Query**:
  - Mengambil data dari `transaction_profits` dengan melakukan eager loading relasi `transaction.user` dan `transaction.paymentMethod`.
  - Mendukung filter `start_date`, `end_date`, `user_id` (kasir), dan `payment_method_id`.
  - Mendukung pagination dan search keyword (mencari nomor invoice transaksi).
  - Menghitung total akumulasi (Total Pendapatan, Total HPP, Total Profit) untuk data yang terfilter untuk ditampilkan di kartu ringkasan.

---

## 4. Desain Frontend (UI / UX Halaman Baru)

### A. Tampilan Halaman "Laporan Profit"
Halaman baru akan dibuat di `resources/js/pages/profit-report/index.tsx` menggunakan komponen-komponen UI premium Tailwind CSS:
1. **Header**: Judul halaman "Laporan Profit".
2. **Kartu Ringkasan Atas**:
   - Tiga kartu visual (Pendapatan, Modal, Profit) dengan gradasi background dinamis.
   - Angka ditampilkan dengan format rupiah.
3. **Filter Area**:
   - Pilihan rentang tanggal (Start & End Date).
   - Dropdown pilihan Kasir (User).
   - Dropdown pilihan Metode Pembayaran.
   - Input pencarian untuk nomor Invoice.
   - Tombol "Reset Filter".
4. **Tabel Ringkasan**:
   - Kolom: Invoice (dapat diklik untuk modal struk), Tanggal, Kasir, Metode Pembayaran, Pendapatan, HPP/Modal, Laba Bersih.
   - Menyoroti profit negatif (merah) atau positif (hijau).

### B. Navigasi & Izin Halaman
- Tambahkan halaman di `app-sidebar.tsx` di bawah kelompok penjualan, terproteksi dengan `PERMISSIONENUMS.TRANSACTION.READ_PROFIT`.
- Tambahkan Web Controller `ProfitReportController` yang merender halaman Inertia `'profit-report/index'`.

---

## 5. Rencana Pengujian (Testing Plan)
1. **Pest Feature Test**:
   - Menguji bahwa proses checkout otomatis membuat entri di tabel `transaction_profits`.
   - Menguji filter tanggal, kasir, dan metode pembayaran pada API `/api/profit-report`.
   - Menguji hak akses (Super Admin & Admin bisa mengakses, User/Kasir ditolak dengan HTTP 403).
2. **Pest Unit Test**:
   - Menguji perhitungan matematika profit di level model/service.
