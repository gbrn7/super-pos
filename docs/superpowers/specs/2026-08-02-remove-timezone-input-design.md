# Design Spec: Remove Timezone Input from Setup Wizard

## Overview
Menghapus field input Zona Waktu (`timezone`) dari Langkah 2 (Detail Toko) pada Quick Setup Wizard, serta mempertahankan default `Asia/Jakarta` secara internal.

## Proposed Changes

### 1. Frontend (`resources/js/pages/setup/index.tsx`)
- Menghapus elemen input `timezone` dari Langkah 2.
- Nilai `timezone` tetap ada pada `useForm` dengan nilai default `'Asia/Jakarta'`.

### 2. Backend (`app/Http/Controllers/SetupController.php`)
- Mengubah aturan validasi `timezone` menjadi `'nullable|string|max:100'`.
- Menggunakan default `$validated['timezone'] ?? 'Asia/Jakarta'` saat penyimpanan.

## Testing & Verification
- Memastikan `SetupControllerTest` dan `EnsureAppIsNotInstalledTest` tetap lulus 100%.
- Memastikan `npm run build` berhasil tanpa error.
