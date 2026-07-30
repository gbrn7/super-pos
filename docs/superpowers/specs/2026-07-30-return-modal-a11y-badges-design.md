# Spesifikasi Desain: Peningkatan Aksesibilitas Keterangan Retur Barang di Modal Retur

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk meningkatkan aspek aksesibilitas (legibility & contrast) pada modal retur barang. Teks keterangan kuantitas transaksi yang sebelumnya terlalu kecil (`text-[10px]`) akan dipindahkan dan ditransformasikan menjadi badge dengan kontras tinggi agar lebih mudah dibaca oleh pengguna lanjut usia.

## 2. Solusi Rancangan

### 2.1 Peningkatan Antarmuka Pengguna (UI)
* **Keterangan Kuantitas:** Dipindahkan dari bawah input kuantitas ke bawah Nama Produk pada kolom pertama.
* **Format Badge:** Keterangan dirender sebagai badge berwarna dengan ukuran font `text-xs` (12px) semi-bold:
  * **Kuantitas Beli awal:** Latar belakang biru muda dengan teks biru tua (`bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800`).
  * **Kuantitas Sudah Diretur:** Latar belakang amber muda dengan teks amber tua (`bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800`).
  * **Kuantitas Sisa Maksimal:** Latar belakang hijau/emerald muda dengan teks hijau/emerald tua (`bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800`).
* **Input Box Kuantitas:** Ukuran angka input diperbesar menjadi `text-sm font-semibold` untuk keterbacaan yang lebih baik saat mengetik kuantitas retur.

**Berkas yang diubah:** [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx)
