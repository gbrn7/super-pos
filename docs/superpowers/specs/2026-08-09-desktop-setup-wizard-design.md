# Specification: Desktop Setup Wizard Simplification & SQLite Optimization

## Objective
Refactor the setup wizard (`/setup`) specifically for the desktop version (`desktop-version` branch) to simplify Step 1 by locking the database driver statically to **SQLite**, removing unnecessary DB connection configuration forms (driver, host, port, username, password), and presenting a streamlined **"Database Initialization & Product Catalog Setup"** interface with integrated custom Excel catalog upload.

---

## 1. Architectural Changes

### 1.1 Backend (`SetupController.php`)
- **`runMigration()`**:
  - Enforce `sqlite` driver configuration automatically.
  - Automatically create/ensure the SQLite database file exists in a user-writable path (`database/database.sqlite` or `storage_path('app/database.sqlite')`).
  - Purge and reconnect DB connection prior to running `Artisan::call('migrate:fresh', ['--force' => true])` and `Artisan::call('db:seed', ['--force' => true])`.
  - Remove requirement for `testDatabase()` invocation prior to running migrations.

- **File Upload (`uploadMasterProduct`, `resetMasterProduct`)**:
  - Retain endpoints to manage `storage/app/temp/custom_master_products.xlsx`.
  - Handled directly within Step 1 before triggering migration/seeding.

### 1.2 Frontend (`resources/js/pages/setup/index.tsx`)
- **Step 1 UI Structure ("Database & Katalog Produk")**:
  - Remove database driver selection dropdown, host, port, username, and password input fields.
  - Display a clean status card indicating **SQLite Local Database** is configured.
  - Present the **Custom Master Product Excel Upload** directly in Step 1 with a clear file dropzone / file picker UI component (no longer hidden behind collapsibles).
  - Single primary action button: **"Inisialisasi Database & Impor Data"** (`handleMigrate`).
  - Upon successful migration/seeding, enable the **"Langkah Berikutnya"** button to proceed to Step 2 (Detail Toko).

### 1.3 Translations & i18n (`resources/js/locales/{id,en}/translation.json`)
- Update `setup.step1.*` keys:
  - `title`: "Langkah 1: Inisialisasi Database & Katalog Produk" / "Step 1: Database Initialization & Product Catalog"
  - `description`: "Inisialisasi database SQLite lokal dan atur katalog produk master Anda." / "Initialize local SQLite database and setup master product catalog."
  - `sqlite_info`: "Menggunakan Database SQLite Lokal" / "Using Local SQLite Database"
  - `run_migration`: "Inisialisasi Database & Impor Data" / "Initialize Database & Import Data"
  - `migrated_seeded`: "Database & Katalog Berhasil Di-inisialisasi" / "Database & Catalog Successfully Initialized"

---

## 2. Testing Strategy
- Verify running `/setup` step 1 loads cleanly without DB connection forms.
- Verify custom Excel file upload and reset work seamlessly.
- Verify clicking "Inisialisasi Database & Impor Data" runs `migrate:fresh` and `db:seed` using SQLite without any errors.
- Verify completing the 3-step wizard logs the user into the POS application.
