# Spesifikasi Desain: Validasi Kuantitas Retur Barang di Frontend dan Backend

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk menambahkan validasi dan informasi kuantitas retur barang pada aplikasi Super POS. Tujuannya adalah agar kasir/pengguna mengetahui kuantitas awal yang dibeli, kuantitas yang sudah diretur sebelumnya, serta sisa kuantitas maksimal yang dapat diretur saat ini secara langsung di dalam antarmuka modal retur.

## 2. Perubahan Backend

### 2.1 Eager Loading Relasi Retur
Pada repository transaksi, kita perlu memuat relasi `returns.details` agar kita dapat menghitung jumlah barang yang sudah diretur dari database secara efisien.

**Berkas yang diubah:** [TransactionRepository.php](file:///home/raygbrn/project/laravel/super-pos/app/Repositories/TransactionRepository.php)
* **Method:** `getById` dan `getByInvoiceNumber`
* **Perubahan:** Tambahkan `'returns.details'` ke dalam array relasi eager loading `with()`.

### 2.2 Eksposur Kuantitas Ter-retur di API Resource
Kita perlu mengirimkan properti `returned_quantity` untuk setiap item detail transaksi ke frontend.

**Berkas yang diubah:** [TransactionDetailResource.php](file:///home/raygbrn/project/laravel/super-pos/app/Http/Resources/TransactionDetailResource.php)
* **Perubahan:**
  ```php
  'returned_quantity' => $this->when(
      $this->transaction->relationLoaded('returns'),
      fn () => $this->transaction->returns->flatMap->details->where('product_id', $this->product_id)->sum('quantity')
  ),
  ```

---

## 3. Perubahan Frontend

### 3.1 Selalu Mengambil Data Terbaru dari Server
Untuk memastikan info kuantitas retur selalu akurat dan tidak menggunakan data cache yang usang dari daftar transaksi, modal retur wajib melakukan fetch ulang detail transaksi dari server setiap kali modal dibuka.

**Berkas yang diubah:** [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx)
* **Perubahan:** Hapus pemeriksaan `existing && existing.length > 0` agar proses `useEffect` selalu menjalankan request `GET` detail transaksi.

### 3.2 Logika Perhitungan Kuantitas Maksimal
Di dalam [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx), kuantitas maksimal yang dapat diretur (`maxQty`) untuk setiap produk akan dihitung ulang secara dinamis:
```typescript
const returnedQty = detail.returned_quantity || 0;
const maxQty = detail.quantity - returnedQty;
```

### 3.3 Penyesuaian Antarmuka (UI) Modal Retur
1. **Kolom Kuantitas Retur:**
   * Tampilkan input angka dengan properti `max={maxQty}`.
   * Di bawah input, tampilkan teks keterangan kecil: `Beli: {detail.quantity} | Diretur: {returnedQty} | Sisa: {maxQty}`.
2. **Validasi Input Kuantitas:**
   * Jika pengguna mengetik kuantitas melebihi `maxQty`, ubah/potong nilainya secara otomatis agar tidak melebihi `maxQty`.
3. **Baris yang Dinonaktifkan (Disabled Row):**
   * Jika `maxQty === 0` (seluruh kuantitas barang sudah diretur), nonaktifkan baris tersebut secara visual (abu-abu).
   * Nonaktifkan input kuantitas dan tombol "Semua" pada baris tersebut.
4. **Tombol "Pilih Semua Transaksi":**
   * Tombol ini hanya akan mengisi kuantitas untuk produk yang memiliki `maxQty > 0`. Produk dengan `maxQty === 0` akan diabaikan.
