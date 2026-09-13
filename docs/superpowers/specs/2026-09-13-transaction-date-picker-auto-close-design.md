# Design Spec: Auto-close Date Picker Popovers in Transaction Module

## Context & Motivation
Pada modul Transaksi (Transaction), pengguna dapat menyaring data berdasarkan Tanggal Mulai dan Tanggal Akhir melalui filter tabel transaksi dan modal ekspor data transaksi. Sebelumnya, komponen `<Popover>` untuk pemilih tanggal (`CalendarPicker`) tidak dikontrol (`uncontrolled`), sehingga setelah pengguna mengklik tanggal pada kalender, popover kalender tetap terbuka hingga pengguna mengklik area luar popover.

Pembaruan ini bertujuan untuk membuat popover kalender langsung otomatis menutup setelah tanggal dipilih, meningkatkan kemudahan dan kecepatan interaksi pengguna.

## Scope of Changes
1. **Filter Tanggal pada Data Table Transaksi** (`resources/js/pages/transaction/data-table.tsx`):
   - Menambahkan state `openStartDate` dan `openEndDate` menggunakan `React.useState(false)`.
   - Mengontrol properti `open` dan `onOpenChange` pada `<Popover>` Tanggal Mulai dan Tanggal Akhir.
   - Pada handler `onSelect` komponen `<CalendarPicker>`, panggil `setOpenStartDate(false)` atau `setOpenEndDate(false)` setelah tanggal dipilih.

2. **Pemilih Rentang Tanggal pada Modal Ekspor Transaksi** (`resources/js/pages/transaction/dialog-modal/export-modal.tsx`):
   - Menambahkan state `openStartDate` dan `openEndDate` menggunakan `React.useState(false)`.
   - Mengontrol properti `open` dan `onOpenChange` pada `<Popover>` Tanggal Mulai dan Tanggal Akhir.
   - Pada handler `onSelect` komponen `<CalendarPicker>`, panggil `setOpenStartDate(false)` atau `setOpenEndDate(false)` setelah tanggal dipilih.

## Component & State Specifications

### 1. `resources/js/pages/transaction/data-table.tsx`
- State:
  - `const [openStartDate, setOpenStartDate] = useState(false);`
  - `const [openEndDate, setOpenEndDate] = useState(false);`
- Elemen Start Date Popover:
  - `<Popover open={openStartDate} onOpenChange={setOpenStartDate}>`
  - `<CalendarPicker onSelect={(date) => { ... setOpenStartDate(false); }} />`
- Elemen End Date Popover:
  - `<Popover open={openEndDate} onOpenChange={setOpenEndDate}>`
  - `<CalendarPicker onSelect={(date) => { ... setOpenEndDate(false); }} />`

### 2. `resources/js/pages/transaction/dialog-modal/export-modal.tsx`
- State:
  - `const [openStartDate, setOpenStartDate] = useState(false);`
  - `const [openEndDate, setOpenEndDate] = useState(false);`
- Elemen Start Date Popover:
  - `<Popover open={openStartDate} onOpenChange={setOpenStartDate}>`
  - `<CalendarPicker onSelect={(date) => { ... setOpenStartDate(false); }} />`
- Elemen End Date Popover:
  - `<Popover open={openEndDate} onOpenChange={setOpenEndDate}>`
  - `<CalendarPicker onSelect={(date) => { ... setOpenEndDate(false); }} />`

## Edge Cases & Error Handling
- Jika tanggal di-uncheck atau dibersihkan melalui tombol pembersih filter (active filter badges), state popover tidak terpengaruh dan tetap tertutup.
- Jika pengguna membuka popover lalu mengklik di luar popover tanpa memilih tanggal, `onOpenChange` akan menangani penutupan popover secara default.

## Testing & Verification
- Verifikasi TypeScript compilation menggunakan `npm run build` atau `npx tsc --noEmit`.
- Verifikasi visual/fungsional bahwa pemilihan tanggal langsung menutup popover dan memperbarui nilai filter secara tepat.
