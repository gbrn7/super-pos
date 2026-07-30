# Spesifikasi Desain: Lokalisasi Menu dan Tombol Retur Barang

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk melokalkan teks menu "Retur Barang" pada sidebar navigasi aplikasi dan tombol aksi "Retur Barang" pada daftar transaksi.

## 2. Solusi Rancangan

### 2.1 Perubahan Terjemahan Lokal
* **Berkas Indonesia:** [translation.json (ID)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/id/translation.json)
  * Tambahkan `"return_menu_label": "Retur Barang"` ke `"sidebar"`.
  * Tambahkan `"return_btn": "Retur Barang"` ke `"component.data_table.action_menu"`.

* **Berkas Inggris:** [translation.json (EN)](file:///home/raygbrn/project/laravel/super-pos/resources/js/locales/en/translation.json)
  * Tambahkan `"return_menu_label": "Product Returns"` ke `"sidebar"`.
  * Tambahkan `"return_btn": "Return Items"` ke `"component.data_table.action_menu"`.

### 2.2 Penyesuaian Kolom Transaksi
**Berkas yang diubah:** [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/transaction/columns.tsx)
* **Perubahan:** Ganti teks label `'Retur Barang'` menggunakan hook `t('component.data_table.action_menu.return_btn', 'Retur Barang')`.
