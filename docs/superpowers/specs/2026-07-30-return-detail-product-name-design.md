# Spesifikasi Desain: Perbaikan Nama Produk pada Detail Retur Barang

## 1. Pendahuluan
Dokumen ini menjelaskan rancangan spesifikasi untuk memperbaiki kesalahan penamaan produk pada detail dialog retur barang di mana nama produk hanya menampilkan kata cadangan default "Produk".

## 2. Penyebab Masalah
Respons API backend (`ProductReturnResource`) mengirimkan nama produk melalui properti datar `product_name` pada objek detail retur, sedangkan frontend (`detail-dialog.tsx`) mencoba membacanya dari relasi nested `product.name`. Karena `product` tidak tersedia dalam respons, rendering nama produk selalu jatuh ke fallback string "Produk".

## 3. Solusi Rancangan

### 3.1 Antarmuka Data Frontend
Perbarui tipe TypeScript agar mengenali field `product_name` opsional.

**Berkas yang diubah:** [columns.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/columns.tsx)
* **Perubahan:** Tambahkan `product_name?: string` ke dalam interface `ReturnDetail`.

### 3.2 Tampilan Modal Detail Dialog
Perbarui rendering cell nama produk untuk menggunakan properti `product_name` yang benar.

**Berkas yang diubah:** [detail-dialog.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/returns/dialog-modal/detail-dialog.tsx)
* **Perubahan:**
  ```typescript
  <TableCell className="font-medium">
      {detail.product_name || detail.product?.name || 'Produk'}
  </TableCell>
  ```
