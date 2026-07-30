# Spesifikasi Desain: Label Bersyarat Tombol Pilih Semua di Modal Retur

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk menyesuaikan label tombol "Pilih Semua Produk" / "Batal Pilih Semua" di modal retur agar memprioritaskan label "Pilih Semua Produk" saat tombol dalam keadaan dinonaktifkan (karena semua barang sudah diretur).

## 2. Solusi Rancangan

**Berkas yang diubah:** [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx)
* **Perubahan:**
  * Gunakan logika penentuan teks label dinamis:
    ```typescript
    const buttonLabel = isAllReturned
        ? 'Pilih Semua Produk'
        : (isAllTransactionSelected ? 'Batal Pilih Semua' : 'Pilih Semua Produk');
    ```
  * Render `{buttonLabel}` di dalam tombol.
