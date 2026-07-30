# Spesifikasi Desain: Penyempurnaan Perilaku Tombol Pilih Semua di Modal Retur

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk menyempurnakan perilaku tombol pilihan massal ("Pilih Semua Produk") di modal retur. Tombol ini akan dinonaktifkan secara otomatis jika semua produk dalam transaksi tersebut sudah sepenuhnya diretur, serta label teksnya akan selalu konsisten menggunakan "Pilih Semua Produk".

## 2. Solusi Rancangan

**Berkas yang diubah:** [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx)
* **Perubahan:**
  * Tambahkan logika pengecekan `isAllReturned` untuk memverifikasi apakah sisa kuantitas retur untuk semua produk bernilai 0.
  * Tambahkan atribut `disabled={isAllReturned}` pada tombol pilihan massal.
  * Hapus percabangan teks label dan gunakan string statis `'Pilih Semua Produk'`.
