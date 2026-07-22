# Spesifikasi Desain: Kustomisasi Cetak Struk Belanja Kasir (Print Receipt Fix)

## Deskripsi Masalah
Ketika kasir mencetak struk belanja menggunakan fitur printer bawaan browser (`window.print()`), latar belakang antarmuka aplikasi kasir ikut terlihat di cetakan. Selain itu, posisi struk tidak proporsional dan terpotong karena tidak disesuaikan dengan ukuran standar printer thermal kasir (58mm/80mm).

## Tujuan Desain
1. Menyembunyikan seluruh antarmuka aplikasi kasir dan elemen modal (seperti backdrop, overlay, tombol "Print" / "Transaksi Baru") saat proses pencetakan berlangsung.
2. Memastikan hanya kartu struk belanja (`#printable-receipt`) yang tercetak.
3. Membatasi lebar struk cetak maksimal `80mm` agar sesuai dengan standar kertas printer thermal kasir dan berada di pojok kiri atas kertas cetak.

## Rencana Implementasi

### 1. Modifikasi Markup React
Pada file [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/components/receipt-modal.tsx):
- Menambahkan atribut `id="printable-receipt"` pada kontainer pembungkus struk belanja:
  ```tsx
  <div
      id="printable-receipt"
      className="max-h-[30vh] overflow-y-auto pr-1.5 space-y-2 py-1 scrollbar-thin print:max-h-none print:overflow-visible print:pr-0"
  >
  ```

### 2. Penambahan CSS Cetak Global
Pada file [app.css](file:///home/raygbrn/project/laravel/super-pos/resources/css/app.css):
- Menambahkan aturan `@media print` untuk menyembunyikan semua elemen selain struk dan menyesuaikan ukurannya:
  ```css
  @media print {
      body * {
          visibility: hidden;
      }
      #printable-receipt,
      #printable-receipt * {
          visibility: visible;
      }
      #printable-receipt {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          max-width: 80mm;
          border: none !important;
          background: white !important;
          color: black !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
      }
      div[role="dialog"],
      [data-state="open"] {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
      }
  }
  ```

## Verifikasi & Pengujian
1. Memformat file dengan Prettier (`npm run format`).
2. Menjalankan pengujian test suite `CashierCheckoutTest` untuk menjamin tidak ada regresi logika.
