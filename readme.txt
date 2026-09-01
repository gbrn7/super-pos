========================================================================
                      PANDUAN INSTALASI PROYEK
========================================================================

Persyaratan Sistem:
- PHP >= 8.3 / 8.4
- Composer
- Node.js & NPM
- Database (MySQL / PostgreSQL / SQLite)

------------------------------------------------------------------------
LANGKAH-LANGKAH INSTALASI
------------------------------------------------------------------------

1. Clone Repository & Masuk ke Direktori Proyek
   git clone <repository-url>
   cd super-pos

2. Install Dependensi PHP (Composer)
   composer install

3. Konfigurasi File Environment (.env)
   Salin file .env.example menjadi .env:
   cp .env.example .env

   Sesuaikan konfigurasi database dan setting lainnya di file .env sesuai kebutuhan Anda.

4. Generate Application Key
   php artisan key:generate

5. Jalankan Migrasi Database & Seeder
   php artisan migrate --seed

6. Install Dependensi Frontend (NPM)
   npm install

7. Generate Route/Action Wayfinder
   Jika melakukan perubahan atau membuat route/controller baru, selalu jalankan Wayfinder dengan flag --with-form:
   
   php artisan wayfinder:generate --with-form

8. Menjalankan Server Pengembangan (Development)
   
   Opsi A (Menjalankan semua worker, server, dan vite sekaligus via composer):
   composer run dev

   Opsi B (Menjalankan manual di terminal terpisah):
   - Terminal 1: php artisan serve
   - Terminal 2: npm run dev
   - Terminal 3: php artisan queue:listen --tries=1

9. Build untuk Production (Opsional)
   npm run build

------------------------------------------------------------------------
CATATAN TAMBAHAN (WAYFINDER)
------------------------------------------------------------------------
Proyek ini menggunakan Laravel Wayfinder untuk integrasi type-safe route antara Laravel dan React/Inertia.
Pastikan selalu menggunakan perintah berikut saat generate:

   php artisan wayfinder:generate --with-form

========================================================================
