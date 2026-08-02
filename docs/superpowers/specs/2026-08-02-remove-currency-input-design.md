# Design Spec: Remove Currency Input from Setup Wizard

## Overview
Menghapus field input Simbol Mata Uang (`currency`) dari Langkah 2 (Detail Toko) pada Quick Setup Wizard, serta mempertahankan default `Rp` secara internal.

## Proposed Changes

### 1. Frontend (`resources/js/pages/setup/index.tsx`)
- Menghapus komponen input `currency` dari JSX Langkah 2.
- Mengubah layout `timezone` dari grid 2 kolom menjadi input full-width.
- Nilai `currency` tetap disertakan pada `useForm` dengan default `'Rp'`.

### 2. Backend (`app/Http/Controllers/SetupController.php`)
- Mengubah aturan validasi `currency` menjadi `'nullable|string|max:10'`.
- Nilai default `$validated['currency'] ?? 'Rp'` digunakan saat menyimpan.

## Testing & Verification
- Memastikan `SetupControllerTest` dan `EnsureAppIsNotInstalledTest` tetap lulus 100%.
- Memastikan `npm run build` berhasil tanpa error TypeScript/JSX.
