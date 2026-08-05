# Design Specification: Superadmin Account Recovery Flow

## 1. Overview
Fitur pemulihan akun ini menyediakan cara bagi administrator/pemilik sistem untuk membuat user dengan role **Superadmin** baru apabila lupa email atau password. Pemulihan ini dilindungi oleh kunci pemulihan rahasia (`RECOVERY_CODE`) yang disimpan di environment server (`.env`).

## 2. Architecture & Data Flow

```
[Login Page] 
     │
     ▼ (Click "Lupa Password / Pemulihan")
[Step 1: Recovery Code Form] ──(POST /api/recovery/verify-code)──► [Laravel Backend]
     │                                                                   │ (Checks RECOVERY_CODE in .env)
     ▼ (Valid Code)                                                      ▼
[Step 2: Superadmin Form]    ──(POST /api/recovery/create-superadmin)─► [Create User & Assign Superadmin Role]
                                                                         │
                                                                         ▼
                                                                [Auto Login & Redirect to Dashboard]
```

## 3. Backend Specification

### Configuration
* `.env`: Tambahkan key `RECOVERY_CODE=kode_rahasia_anda`
* `config/auth.php` atau file config relevan: Mendaftarkan `recovery_code` => `env('RECOVERY_CODE')`.

### Endpoints & Controller (`App\Http\Controllers\Auth\RecoveryController`)
1. **`POST /api/recovery/verify-code`**
   * **Request:** `{ "recovery_code": "string" }`
   * **Logic:** 
     * Validasi input.
     * Bandingkan dengan `config('auth.recovery_code')` atau `env('RECOVERY_CODE')`.
     * Jika cocok, buat token sementara di sESI/Cache (berlaku 10-15 menit) dan kirim status success.
     * Jika salah, kembalikan response error 422 dengan pesan i18n backend.
2. **`POST /api/recovery/create-superadmin`**
   * **Request:** `{ "name": "string", "email": "string", "password": "string", "password_confirmation": "string" }`
   * **Logic:**
     * Pastikan token sesi verifikasi valid.
     * Validasi atribut user (Email unik, password minimum requirement).
     * Buat `User` baru.
     * Assign role `Superadmin` ke user tersebut.
     * `Auth::login($user)`.
     * Hapus token sesi verifikasi.
     * Kembalikan response redirect/success.

## 4. Frontend Specification (Multi-Step Form)

### Location & State
* Terintegrasi pada Halaman Auth/Login (`resources/js/pages/auth/login.tsx` atau sejenisnya).
* State pengelolaan mode/step: `'login' | 'recovery_step_1' | 'recovery_step_2'`.

### Visual Components & UX
* **Login Step:** Menampilkan tombol link *"Lupa Password / Pemulihan Akun"* di bawah form login.
* **Step 1 (Recovery Code):** Form input single field untuk Kode Pemulihan dengan opsi *"Kembali ke Login"*.
* **Step 2 (Create Superadmin):** Form input Name, Email, Password, & Password Confirmation.

## 5. Internationalization (Multi-language Support)
* **Frontend:** Menambahkan kunci terjemahan di file-file JSON/TS locale (misal `id`, `en`, dll.) di bawah `resources/js/locales/` atau file i18n proyek.
* **Backend:** Menambahkan pesan error/sukses terjemahan di file `lang/id/auth.php` dan `lang/en/auth.php` (serta bahasa pendukung lainnya jika ada).

## 6. Security Considerations
* **Rate Limiting:** Terapkan rate-limiter pada `verify-code` endpoint (misal maks 5 percobaan per menit per IP) untuk mencegah brute-forcing `RECOVERY_CODE`.
* **Session Token Expiry:** Sesi verifikasi otomatis hangus setelah user dibuat atau expired dalam 15 menit.

## 7. Testing Strategy
* **Feature Tests (Pest PHP):**
  * Test verifikasi `RECOVERY_CODE` berhasil dan gagal.
  * Test pembatasan rate limiter pada percobaan salah berulang.
  * Test pembuatan user Superadmin dan validasi kelengkapan form.
  * Test otentikasi otomatis setelah pendaftaran.
