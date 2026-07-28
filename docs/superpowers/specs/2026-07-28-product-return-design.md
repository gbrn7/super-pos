# Design Spec: Fitur Pengembalian Barang (Retur) & Refund Parsial

**Tanggal**: 2026-07-28  
**Status**: Approved  
**Aplikasi**: Super-POS (Laravel + Inertia React)

---

## 1. Ringkasan Fitur
Fitur Retur Barang memungkinkan kasir/admin memproses pengembalian barang dari customer yang sudah melakukan transaksi. Fitur ini mendukung retur parsial (sebagian produk dari satu struk), otomatis mengembalikan stok barang ke inventaris toko, serta memotong saldo dompet kas toko sesuai dana refund yang dikembalikan.

---

## 2. Struktur Database (Schema)

### 2.1 Tabel `returns`
| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | BigIncrements | Primary Key |
| `return_number` | String (Unique) | Format: `RET-YYYYMMDD-XXXX` |
| `transaction_id` | Foreign Key | Relasi ke `transactions.id` |
| `user_id` | Foreign Key | Relasi ke `users.id` (Kasir yang memproses) |
| `total_refund_amount` | Decimal(15, 2) | Total dana yang dikembalikan |
| `reason` | Text (Nullable) | Catatan alasan pengembalian barang |
| `created_at` / `updated_at` | Timestamp | Standard Laravel timestamps |

### 2.2 Tabel `return_details`
| Field | Tipe Data | Keterangan |
|---|---|---|
| `id` | BigIncrements | Primary Key |
| `return_id` | Foreign Key | Relasi ke `returns.id` (Cascade Delete) |
| `product_id` | Foreign Key | Relasi ke `products.id` |
| `quantity` | Integer | Jumlah unit yang dikembalikan |
| `price_per_unit` | Decimal(15, 2) | Harga per unit saat transaksi awal |
| `subtotal` | Decimal(15, 2) | `quantity * price_per_unit` |

---

## 3. Logika Bisnis & Transaksi (Backend)

1. **Validasi Kuantitas Retur**:
   - Jumlah produk yang bisa diretur maksimal adalah `(Kuantitas di Transaksi Asli - Total Kuantitas yang Sudah Pernah Diretur)`.
2. **Atomic DB Transaction (`DB::transaction`)**:
   - Pembuatan record `Return` & `ReturnDetail`.
   - Update stok produk: `Product::increment('stock', $quantity)`.
   - Update saldo dompet toko (pencatatan transaksi keluar refund).
3. **Pengelolaan Kas / Wallet**:
   - Mengurangi saldo dompet usaha toko sesuai besaran `total_refund_amount`.

---

## 4. Antarmuka Pengguna (Frontend - Inertia React)

1. **Aksi Retur di Riwayat Transaksi**:
   - Menambahkan tombol "Retur Barang" pada detail modal / baris transaksi di halaman Riwayat Transaksi.
2. **Modal Form Retur**:
   - Menampilkan list barang yang dipesan pada transaksi tersebut.
   - Input field kuantitas yang dikembalikan untuk tiap barang (dengan validator max sesuai sisa kuantitas).
   - Textarea alasan retur.
   - Kalkulasi otomatis total refund secara *real-time*.
3. **Menu / Tab Riwayat Retur**:
   - Halaman daftar histori pengembalian barang (`/returns`) untuk memantau retur yang pernah terjadi beserta detail item dan total refund.

---

## 5. Pengujian & Verifikasi (Testing Plan)

- **Unit / Feature Test (Pest PHP)**:
  - Test pembuatan retur parsial dan retur penuh.
  - Test validasi batas maksimum kuantitas retur.
  - Test pertambahan stok produk setelah retur berhasil.
  - Test pengurangan saldo dompet toko setelah retur.
