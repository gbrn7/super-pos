# Print Receipt Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyembunyikan antarmuka aplikasi kasir dan elemen dialog selain struk saat mencetak, serta membatasi lebar maksimal struk belanja ke ukuran standar printer thermal (80mm).

**Architecture:** Menambahkan atribut `id="printable-receipt"` pada kontainer struk di `ReceiptModal` dan menambahkan CSS media query `@media print` pada berkas `app.css` untuk mengatur visibility elemen saat cetak.

**Tech Stack:** React 19, Tailwind CSS v4, CSS3 Media Queries

## Global Constraints
- Seluruh antarmuka di luar struk harus disembunyikan saat mencetak.
- Lebar struk dibatasi maksimal `80mm` pada cetakan fisik/PDF.
- Struk diposisikan di pojok kiri atas halaman cetak (`top: 0`, `left: 0`).

---

### Task 1: Modifikasi Markup Struk dan CSS Cetak

**Files:**
- Modify: `resources/js/pages/cashier/components/receipt-modal.tsx:73-80`
- Modify: `resources/css/app.css:140-144`

**Interfaces:**
- Consumes: `Transaction` details list structure.
- Produces: Correctly targeted printable element wrapper and media query print overrides.

- [ ] **Step 1: Edit `receipt-modal.tsx`**

Buka file [receipt-modal.tsx](file:///home/raygbrn/project/laravel/super-pos/resources/js/pages/cashier/components/receipt-modal.tsx#L73-L80) dan tambahkan atribut `id="printable-receipt"` pada pembungkus struk belanja.

Ubah kode target berikut:
```tsx
                {/* Printable Receipt Card */}
                <div className="max-h-[30vh] overflow-y-auto pr-1.5 space-y-2 py-1 scrollbar-thin print:max-h-none print:overflow-visible print:pr-0">
```

Menjadi:
```tsx
                {/* Printable Receipt Card */}
                <div
                    id="printable-receipt"
                    className="max-h-[30vh] overflow-y-auto pr-1.5 space-y-2 py-1 scrollbar-thin print:max-h-none print:overflow-visible print:pr-0"
                >
```

- [ ] **Step 2: Edit `app.css`**

Buka file [app.css](file:///home/raygbrn/project/laravel/super-pos/resources/css/app.css#L140-L144) dan tambahkan aturan `@media print` di bagian akhir file.

Ubah kode target berikut:
```css
@layer base {
    * {
        @apply border-border;
    }

    body {
        @apply bg-background text-foreground;
    }
}
```

Menjadi:
```css
@layer base {
    * {
        @apply border-border;
    }

    body {
        @apply bg-background text-foreground;
    }
}

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

- [ ] **Step 3: Jalankan formatting**

Jalankan perintah berikut untuk merapikan kode:
```bash
npm run format
```
Expected: Perintah berjalan sukses dan merapikan file `receipt-modal.tsx` serta `app.css`.

- [ ] **Step 4: Jalankan lint check**

Jalankan ESLint pada file React yang diubah untuk memastikan tidak ada pelanggaran aturan penulisan kode:
```bash
npx eslint resources/js/pages/cashier/components/receipt-modal.tsx --fix
```
Expected: Hasil pengujian eslint tidak memiliki error (exit code 0).

- [ ] **Step 5: Jalankan typecheck**

Jalankan pemeriksaan tipe data proyek untuk menjamin fungsionalitas kompilasi TypeScript:
```bash
npm run types:check
```
Expected: Tidak ada error kompilasi TypeScript baru (exit code 0).

- [ ] **Step 6: Komit perubahan**

Jalankan git commit untuk menyimpan perubahan:
```bash
git add resources/js/pages/cashier/components/receipt-modal.tsx resources/css/app.css
git commit -m "style(cashier): hide page background and style receipt width on print"
```
