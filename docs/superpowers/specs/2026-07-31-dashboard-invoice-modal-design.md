# Spesifikasi Desain: Fitur Detail Transaksi dari Dashboard

## 1. Latar Belakang & Tujuan
Saat ini, di halaman Dashboard terdapat tabel yang menampilkan transaksi terbaru. Namun, nomor invoice dalam tabel tersebut hanya berupa teks biasa yang tidak dapat diklik. Pengguna menginginkan kemampuan untuk melihat struk atau detail dari transaksi tersebut secara instan dengan mengeklik nomor invoice langsung dari Dashboard.

Tujuan dari perubahan ini adalah mengintegrasikan modal detail transaksi (`DetailDialog`) ke halaman Dashboard.

---

## 2. Rencana Perubahan Detail

### A. Modifikasi `resources/js/pages/dashboard.tsx`
1. **Impor Komponen**:
   - `import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';`
   - `import axiosInstance from '@/lib/axios';`
   - `import { handleApiError } from '@/lib/utils';`

2. **Inisialisasi State**:
   - State `selectedTransaction` (menyimpan data transaksi terpilih).
   - State `detailOpen` (boolean untuk mengontrol visibility modal).

3. **Handler API**:
   - Fungsi `handleInvoiceClick(invoiceNumber: string)` yang melakukan `GET` request ke `/api/transactions/invoice/${invoiceNumber}`. Jika sukses, isi state `selectedTransaction` dan set `detailOpen` menjadi `true`.

4. **Interaktivitas Kolom Invoice**:
   - Ubah `<TableCell className="font-semibold text-xs text-primary">{tx.invoice_number}</TableCell>` menjadi elemen interaktif dengan handler `onClick` dan style `cursor-pointer hover:underline`.

5. **Rendering Modal**:
   - Render `<DetailDialog>` di bagian bawah JSX Dashboard.

---

## 3. Rencana Pengujian (Testing)
- Pengujian manual melalui browser (atau smoke testing) untuk memastikan:
  - Nomor invoice tampil dengan styling hover (underline) dan cursor-pointer.
  - Saat diklik, loader/modal muncul dengan informasi transaksi yang benar.
  - Modal dapat ditutup kembali dengan baik.
