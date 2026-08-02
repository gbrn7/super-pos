# Design Spec: Quick Setup Wizard

## Overview
Quick Setup Wizard adalah fitur untuk mengonfigurasi aplikasi POS saat pertama kali dipasang (fresh installation). Wizard ini akan memandu pengguna dalam 3 langkah mudah:
1. Memeriksa koneksi database & menjalankan migrasi awal + seeder role.
2. Mengisi informasi toko (Store settings: nama toko, alamat, no. telp, mata uang, timezone).
3. Membuat akun Owner pertama dengan role `superadmin`.

Setelah setup selesai, sistem menandai aplikasi sebagai "terpasang" (installed) menggunakan file marker `storage/app/installed`, melogin-kan user owner, dan mengarahkannya ke dashboard utama.

---

## Architecture & Components

### 1. Middleware Strategy
- **`EnsureAppIsNotInstalled`**:
  - Pengecekan file marker `storage_path('app/installed')`.
  - Jika file **TIDAK ADA**: Semua request (kecuali ke `/setup` dan aset publik) di-redirect ke `/setup`.
  - Jika file **ADA**: Request ke `/setup` di-redirect ke dashboard `/` atau `/login`.

### 2. Frontend Layout & Components (Shadcn UI + Inertia React v3)
- **Location**: `resources/js/pages/setup/index.tsx`
- **Layout**: Clean Centered Card Layout (Card, Gradient background, Progress/Stepper bar).
- **Steps**:
  - **Step 1: Database Check & Migration**
    - Pengecekan koneksi DB.
    - Tombol "Run Migration & Seed".
    - Progress indicator & status sukses.
  - **Step 2: Store Information**
    - Form Input: Store Name, Address, Phone Number, Currency Symbol (misal: Rp), Timezone.
  - **Step 3: Account Owner**
    - Form Input: Full Name, Email, Password, Password Confirmation.
    - Tombol "Complete Setup & Launch POS".

### 3. Backend Routes & Controllers
- **Routes (`routes/web.php`)**:
  - `GET /setup` -> `SetupController@index`
  - `POST /setup/test-db` -> `SetupController@testDatabase`
  - `POST /setup/migrate` -> `SetupController@runMigration`
  - `POST /setup/complete` -> `SetupController@complete`

- **Controller (`app/Http/Controllers/SetupController.php`)**:
  - `testDatabase()`: Memeriksa koneksi PDO DB.
  - `runMigration()`: Menjalankan `Artisan::call('migrate:fresh', ['--force' => true])` dan seeder role dasar.
  - `complete()`:
    - Validasi data Store & Owner.
    - Menggunakan DB Transaction:
      1. Menyimpan data toko ke tabel `settings`.
      2. Membuat user Owner & memberikan role `superadmin`.
    - Membuat file marker `storage/app/installed`.
    - `Auth::login($user)`.
    - Inertia redirect ke `/dashboard`.

---

## Verification & Testing (Pest PHP)
- **Middleware Tests**:
  - Memastikan redirect otomatis ke `/setup` jika file `storage/app/installed` belum ada.
  - Memastikan `/setup` tidak dapat diakses jika file marker sudah ada.
- **Feature Tests**:
  - Test endpoint `testDatabase` & `runMigration`.
  - Test endpoint `complete` untuk memastikan User Owner terbuat dengan role `superadmin`, setting tersimpan, file marker `installed` tercipta, dan user berhasil ter-login.
