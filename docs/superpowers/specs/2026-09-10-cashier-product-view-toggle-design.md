# Cashier Product View Mode Toggle Specification

## 1. Overview
Fitur ini menambahkan tombol pengalih (toggle) mode tampilan daftar barang di modul kasir (`/kasir`), memungkinkan kasir beralih antara:
1. **Mode Tabel (List tanpa gambar)**: Tampilan tabel ringkas yang cepat dan padat informasi, ideal untuk barcode scanning dan transaksi cepat kasir minimarket.
2. **Mode Grid (Kartu dengan gambar)**: Tampilan kartu visual dengan foto produk menggunakan komponen `ProductCard`, ideal untuk toko ritel/butik/F&B yang membutuhkan identifikasi visual barang secara langsung.

Preferensi tampilan pengguna disimpan ke dalam `localStorage` browser sehingga tetap tersimpan saat pengguna memuat ulang halaman.

## 2. User Experience & UI Details

### 2.1 Toggle Button di Header Panel
- **Lokasi**: Di header panel produk kiri (`resources/js/pages/cashier/index.tsx`), sejajar dengan badge jumlah data barang.
- **Tampilan**: Segmented button control dengan ikon:
  - `List` icon: Mode Tabel (Default)
  - `LayoutGrid` icon: Mode Kartu Bergambar
- **Tooltip & Accessibility**:
  - Tombol Tabel: `title="Tabel (Tanpa Gambar)"`
  - Tombol Grid: `title="Grid (Dengan Gambar)"`
- **Active State**: Tombol yang aktif memiliki kontras visual yang jelas (`bg-background text-foreground shadow-xs font-bold`) sedangkan tombol non-aktif memiliki gaya muted (`text-muted-foreground hover:text-foreground`).

### 2.2 Content Display
- **Mode Tabel (`table`)**:
  - Menggunakan tabel HTML yang sudah ada dengan komponen `ProductRow`.
  - Skeleton loading: 8 baris skeleton tabel (`Skeleton className="h-10 ..."`).
- **Mode Grid (`grid`)**:
  - Menggunakan CSS Grid responsif: `grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`.
  - Menggunakan komponen `ProductCard` yang menampilkan:
    - Foto produk (`/storage/{product.image}`) atau placeholder ikon gambar jika belum ada foto.
    - Badge sisa stok (Habis, Kritis, atau Normal).
    - Nama barang dan satuan produk.
    - Harga jual format Rupiah.
    - Status keranjang (`isInCart`).
    - Overlay tombol tambah (+) saat hover dan klik untuk menambahkan ke keranjang.
  - Skeleton loading: Grid kartu skeleton dengan aspek rasio kotak gambar dan info barang di bawahnya.

### 2.3 State Management & Persistence
- State React: `viewMode` dengan tipe `'table' | 'grid'`.
- Default: `'table'`, atau membaca nilai tersimpan dari `localStorage.getItem('cashier_view_mode')`.
- Event change: Menyimpan preferensi baru ke `localStorage.setItem('cashier_view_mode', mode)`.

### 2.4 Pagination & Filter Integration
- Filter pencarian kata kunci/barcode dan filter kategori tetap bekerja identik di kedua mode tampilan.
- Navigasi paginasi di bagian bawah panel kiri tetap konsisten untuk kedua mode.

## 3. Testing & Verification Plan
- Memastikan pergantian antar tombol `table` dan `grid` mengubah layout dengan mulus tanpa error konsol.
- Memastikan klik pada kartu di mode grid berhasil menambahkan produk ke keranjang belanja kasir.
- Memastikan reload halaman browser mempertahankan mode tampilan yang terakhir dipilih (persistensi `localStorage`).
- Memastikan pencarian dan filter kategori tetap menampilkan hasil produk yang sesuai di mode grid.
- Memverifikasi build frontend (`npm run build`) berjalan bersih tanpa error TypeScript / linting.
