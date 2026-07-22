# Spesifikasi Desain: Receipt Modal Overflow Fix

## Deskripsi Masalah
Ketika kasir mengonfirmasi transaksi dengan jumlah barang yang banyak, modal struk belanja (`ReceiptModal`) akan melar vertikal melebihi batas layar ponsel atau desktop. Hal ini menyebabkan tombol penting di bagian footer modal (seperti "Print" dan "Transaksi Baru") terdorong ke bawah layar dan tidak dapat diklik atau dilihat oleh pengguna.

## Tujuan Desain
1. Membatasi tinggi tampilan modal struk di layar agar tidak melebihi tinggi layar pengguna.
2. Mempertahankan visual header struk (nama toko, tanggal, invoice) di bagian atas dan footer struk (total belanja, kembalian) di bagian bawah tetap tersemat (fixed) saat daftar barang di-scroll.
3. Memastikan seluruh konten struk ter-print utuh tanpa terpotong atau memiliki scrollbar saat dicetak fisik/PDF.

## Rencana Implementasi

### Modifikasi Komponen
Pada file [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/components/receipt-modal.tsx):
- Membungkus kontainer daftar barang (`details.map`) dengan `div` pembatas tinggi dan scroll:
  ```tsx
  <div className="max-h-[30vh] overflow-y-auto pr-1.5 print:max-h-none print:overflow-visible print:pr-0 scrollbar-thin">
      {/* List barang */}
  </div>
  ```

### Verifikasi & Pengujian
1. Menjalankan formatter Prettier (`npm run format`) pada berkas terkait.
2. Menjalankan pengujian test suite `CashierCheckoutTest` untuk menjamin tidak ada regresi logika.
