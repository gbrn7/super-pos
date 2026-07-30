# Spesifikasi Desain: Implementasi Multi-Language (i18n) pada Modul Retur Barang

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk menerapkan lokalisasi multibahasa (i18n) secara penuh di dalam modul retur barang. Semua teks yang sebelumnya ditulis secara statis (hardcoded) akan digantikan dengan fungsi penerjemahan `t()` berbasis react-i18next dan didaftarkan di dalam berkas locales JSON untuk bahasa Indonesia (ID) dan bahasa Inggris (EN).

## 2. Solusi Rancangan

### 2.1 Perubahan Berkas Terjemahan
Menambahkan objek `"return"` di dalam blok `"page"` pada berkas JSON terjemahan.

* **Berkas Indonesia:** [translation.json (ID)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/id/translation.json)
* **Berkas Inggris:** [translation.json (EN)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/en/translation.json)

### 2.2 Penyesuaian Komponen Modal Retur
Memperbarui modal retur agar memuat hook terjemahan dan menerjemahkan semua string antarmuka pengguna.

* **Berkas yang diubah:** [ReturnModal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/Components/ReturnModal.tsx)
  * Impor `useTranslation`.
  * Ganti teks statis seperti `'Retur Barang'`, `'Cari'`, `'Beli:'`, `'Diretur:'`, `'Sisa:'`, `'Alasan Retur'` dengan pemanggilan fungsi `t()`.
