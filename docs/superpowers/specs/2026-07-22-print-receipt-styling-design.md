# Spesifikasi Desain: Desain Retro Struk Belanja Kasir Monospace (Indomaret Style)

## Deskripsi Masalah
Kasir membutuhkan struk belanja yang memiliki estetika retro monospace seperti struk belanja kasir fisik (Indomaret/minimarket style). Struk harus memiliki kolom teratur untuk nama barang, kuantitas, harga asli, dan subtotal, serta menampilkan informasi diskon di bawah baris barang terkait secara rapi tanpa merusak kelurusan kolom.

## Tujuan Desain
1. Mengubah visual struk belanja kasir menjadi monospace murni (`font-mono`) dengan pemisah teks `================================` dan `--------------------------------`.
2. Menyajikan daftar barang dalam 4 kolom sejajar: Nama Barang, Qty, Harga Satuan, dan Subtotal.
3. Menampilkan baris `DISKON : (nilai_diskon)` langsung di bawah barang jika barang tersebut memiliki potongan harga.
4. Menampilkan ringkasan pembayaran di bagian bawah: `TOTAL`, `TUNAI`, `KEMBALI`, dan `ANDA HEMAT` (total penghematan dari akumulasi seluruh diskon).
5. Memastikan struk tercetak bersih, tanpa elemen luar aplikasi, dan memiliki lebar maksimal standar printer thermal `80mm`.

## Rencana Implementasi

### 1. Modifikasi Komponen `ReceiptModal`
Pada file [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/components/receipt-modal.tsx):
- Menghapus awalan `Rp` dalam nominal struk untuk menjaga keaslian struk belanja kasir menggunakan helper lokal `formatPrice`.
- Mengatur kolom daftar barang menggunakan kombinasi flexbox lebar tetap:
  - Nama: `flex-1 text-left truncate`
  - Qty: `w-8 text-right`
  - Harga Satuan: `w-16 text-right`
  - Subtotal: `w-20 text-right`
- Menyisipkan baris diskon di bawah barang dengan format parentesis:
  ```tsx
  {disc > 0 && (
      <div className="flex justify-between text-[11px] text-muted-foreground/90 font-medium">
          <span className="flex-1"></span>
          <span className="w-16 text-right">DISKON :</span>
          <span className="w-20 text-right">({formatPrice(disc * detail.quantity)})</span>
      </div>
  )}
  ```
- Menghitung total penghematan (`ANDA HEMAT`):
  ```tsx
  const totalItemDiscount = details.reduce(
      (acc, detail) => acc + (Number(detail.discount) || 0) * detail.quantity,
      0,
  );
  const totalSavings = totalItemDiscount + discountAmount;
  ```

### 2. Modifikasi Header & Footer Struk
- Menampilkan alamat toko kustom sesuai contoh:
  - Nama Toko: `Toko Maju Jaya`
  - Alamat: `Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur`
  - Telepon: `Telp: 081234567890`
- Mengubah ucapan terima kasih menjadi: `TERIMA KASIH. SELAMAT BELANJA KEMBALI`

## Verifikasi & Pengujian
1. Memformat file dengan Prettier (`npm run format`).
2. Menjalankan lint check (`npx eslint`) dan typecheck (`npm run types:check`).
3. Menjalankan pengujian test suite `CashierCheckoutTest`.
