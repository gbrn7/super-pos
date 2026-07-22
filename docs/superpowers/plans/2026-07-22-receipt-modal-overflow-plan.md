# Receipt Modal Overflow Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membatasi tinggi tampilan daftar barang di modal struk belanja sehingga modal tidak melar melebihi tinggi layar, namun tetap tercetak utuh saat di-print.

**Architecture:** Membungkus elemen rendering daftar barang (`details.map`) di `ReceiptModal` menggunakan kontainer `div` dengan tinggi maksimum, scrollbar vertikal pada layar (`max-h-[30vh] overflow-y-auto`), dan menonaktifkannya saat dicetak (`print:max-h-none print:overflow-visible`).

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript

## Global Constraints
- Pembatasan tinggi maksimum `max-h-[30vh]` hanya aktif pada tampilan layar.
- Seluruh struk belanja harus tercetak utuh tanpa terpotong atau memunculkan scrollbar pada media cetak (`print:`).
- Tidak merusak kompatibilitas fungsionalitas transaksi kasir.

---

### Task 1: Modifikasi ReceiptModal Layout

**Files:**
- Modify: `resources/js/pages/cashier/components/receipt-modal.tsx:91-145`

**Interfaces:**
- Consumes: `Transaction` model data and receipt details.
- Produces: Updated scrollable receipt rendering UI.

- [ ] **Step 1: Edit `receipt-modal.tsx`**

Buka file [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/components/receipt-modal.tsx#L91-L145) dan bungkus pemetaan daftar barang (`details.map`) dengan kelas pembatas scroll dan print override.

Ubah kode target berikut:
```tsx
                    {/* Items List */}
                    <div className="space-y-2 py-1">
                        {details.map((detail, index) => {
```

Menjadi:
```tsx
                    {/* Items List */}
                    <div className="max-h-[30vh] overflow-y-auto pr-1.5 space-y-2 py-1 scrollbar-thin print:max-h-none print:overflow-visible print:pr-0">
                        {details.map((detail, index) => {
```

- [ ] **Step 2: Jalankan formatting**

Jalankan perintah berikut untuk merapikan kode:
```bash
npm run format
```
Expected: Perintah berjalan sukses dan merapikan file `receipt-modal.tsx`.

- [ ] **Step 3: Jalankan lint check**

Jalankan ESLint pada file yang diubah untuk memastikan tidak ada pelanggaran aturan penulisan kode:
```bash
npx eslint resources/js/pages/cashier/components/receipt-modal.tsx --fix
```
Expected: Hasil pengujian eslint tidak memiliki error (exit code 0).

- [ ] **Step 4: Jalankan typecheck**

Jalankan pemeriksaan tipe data proyek untuk menjamin fungsionalitas kompilasi TypeScript:
```bash
npm run types:check
```
Expected: Tidak ada error kompilasi TypeScript baru pada `receipt-modal.tsx` (exit code 0).

- [ ] **Step 5: Komit perubahan**

Jalankan git commit untuk menyimpan perubahan:
```bash
git add resources/js/pages/cashier/components/receipt-modal.tsx
git commit -m "style(cashier): make receipt modal items list scrollable and printable"
```
