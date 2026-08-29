# Super POS (Point of Sale)

Super POS adalah aplikasi Kasir (Point of Sale) desktop yang dibangun menggunakan **Laravel 12**, **Inertia.js v3 (React 19)**, dan **NativePHP (Electron)**.

## Konfigurasi Database (SQLite)

Aplikasi ini menggunakan **SQLite** sebagai database engine default-nya. Lokasi file database (`nativephp.sqlite` / `database.sqlite`) ditentukan secara dinamis berdasarkan lingkungan (environment) aplikasi dijalankan:

### 1. Mode Pengembangan (Development / Local)
Saat menjalankan aplikasi di lingkungan lokal/development menggunakan perintah `php artisan native:serve`, database disimpan di dalam direktori project:
* **Lokasi:** `database/nativephp.sqlite`

### 2. Mode Produksi (Hasil Build / Packaged App)
Ketika aplikasi sudah di-build menjadi installer (misal .exe, .deb, .dmg) dan diinstal pada komputer client/user, file database **tidak** dibundel di dalam package aplikasi (ASAR) demi alasan keamanan dan kebutuhan hak akses tulis (write permission).

NativePHP secara otomatis mendeteksi dan membuat file database di direktori data pengguna (**User Data Directory**) masing-masing OS. Lokasinya disesuaikan dengan ID aplikasi (`app_id` pada `config/nativephp.php`, default: `com.nativephp.app`):

* **Windows:**
  `%APPDATA%\[app_id]\database.sqlite`
  *(Contoh: `C:\Users\<Username>\AppData\Roaming\com.nativephp.app\database.sqlite`)*

* **Linux:**
  `~/.config/[app_id]/database.sqlite`
  *(Contoh: `/home/<Username>/.config/com.nativephp.app/database.sqlite`)*

* **macOS:**
  `~/Library/Application Support/[app_id]/database.sqlite`
  *(Contoh: `/Users/<Username>/Library/Application Support/com.nativephp.app/database.sqlite`)*

---

## Pengembangan (Development)

Untuk menjalankan server development:

```bash
# Menjalankan Vite assets bundler
npm run dev

# Menjalankan aplikasi NativePHP Electron
php artisan native:serve
```

Untuk mem-build aplikasi ke executable desktop:

```bash
php artisan native:build
```
