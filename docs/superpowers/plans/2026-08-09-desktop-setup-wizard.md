# Desktop Setup Wizard Simplification & SQLite Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor setup wizard Step 1 to statically use SQLite, eliminate unnecessary DB credential input forms, and provide a streamlined "Database Initialization & Product Catalog Setup" screen with custom Excel catalog upload on the `desktop-version` branch.

**Architecture:** Update `SetupController@runMigration` to automatically ensure SQLite database file existence, update i18n translation keys in Indonesian and English, and redesign React setup page (`resources/js/pages/setup/index.tsx`) Step 1 to remove DB driver dropdown and inputs in favor of an active SQLite status badge, prominent Excel upload dropzone, and a single "Initialize Database & Import Data" action button.

**Tech Stack:** Laravel 12 (PHP 8.4), React 19, Inertia.js v3, Tailwind CSS v4, Lucide React icons, Pest 3 testing.

## Global Constraints

- Branch: `desktop-version`
- Database driver: `sqlite`
- DB Database Path: `database/database.sqlite` (or `storage_path('app/database.sqlite')` if base path is read-only)

---

### Task 1: Update i18n Translation Files for Step 1 Setup

**Files:**
- Modify: `resources/js/locales/id/translation.json:1519-1539`
- Modify: `resources/js/locales/en/translation.json`

**Interfaces:**
- Consumes: Existing i18n translation keys
- Produces: Updated `setup.step1.*` translation keys for Indonesian and English

- [ ] **Step 1: Update Indonesian translations (`id/translation.json`)**

Update `setup.step1` block in `resources/js/locales/id/translation.json`:

```json
        "step1": {
            "title": "Langkah 1: Inisialisasi Database & Katalog Produk",
            "description": "Inisialisasi database SQLite lokal dan atur katalog produk master Anda.",
            "sqlite_info": "Menggunakan Database SQLite Lokal",
            "custom_catalog": "Katalog Produk Master (Opsional)",
            "custom_catalog_active": "File Kustom Aktif",
            "custom_catalog_desc": "Unggah file Excel (.xlsx / .xls) untuk katalog produk kustom Anda, atau biarkan kosong untuk menggunakan katalog default 50.000+ produk.",
            "select_excel_file": "Pilih File Excel (.xlsx / .xls)",
            "uploading": "Mengunggah...",
            "error_alert_title": "Terjadi Kesalahan",
            "run_migration": "Inisialisasi Database & Impor Data",
            "migrated_seeded": "Database & Katalog Berhasil Di-inisialisasi",
            "next_step": "Langkah Berikutnya"
        },
```

- [ ] **Step 2: Update English translations (`en/translation.json`)**

Update `setup.step1` block in `resources/js/locales/en/translation.json`:

```json
        "step1": {
            "title": "Step 1: Database Initialization & Product Catalog",
            "description": "Initialize local SQLite database and setup master product catalog.",
            "sqlite_info": "Using Local SQLite Database",
            "custom_catalog": "Master Product Catalog (Optional)",
            "custom_catalog_active": "Custom File Active",
            "custom_catalog_desc": "Upload an Excel file (.xlsx / .xls) for your custom product catalog, or leave empty to use the default catalog of 50,000+ products.",
            "select_excel_file": "Select Excel File (.xlsx / .xls)",
            "uploading": "Uploading...",
            "error_alert_title": "An Error Occurred",
            "run_migration": "Initialize Database & Import Data",
            "migrated_seeded": "Database & Catalog Successfully Initialized",
            "next_step": "Next Step"
        },
```

- [ ] **Step 3: Commit i18n changes**

```bash
git add resources/js/locales/id/translation.json resources/js/locales/en/translation.json
git commit -m "i18n: update setup step 1 translation keys for desktop version"
```

---

### Task 2: Simplify Backend `SetupController` for SQLite Automatic Setup

**Files:**
- Modify: `app/Http/Controllers/SetupController.php:129-174`
- Test: `tests/Feature/Setup/SetupControllerTest.php`

**Interfaces:**
- Consumes: `POST /setup/migrate` route
- Produces: Clean JSON response `{'success': true, 'message': '...'}` on database migration and seeding

- [ ] **Step 1: Write feature test for `SetupController@runMigration`**

Create `tests/Feature/Setup/DesktopSetupTest.php`:

```php
<?php

namespace Tests\Feature\Setup;

use Tests\TestCase;

class DesktopSetupTest extends TestCase
{
    public function test_run_migration_initializes_sqlite_database_successfully(): void
    {
        $response = $this->postJson('/setup/migrate');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
```

- [ ] **Step 2: Run test to verify it passes or check baseline behavior**

Run: `php artisan test --compact --filter=DesktopSetupTest`
Expected: PASS

- [ ] **Step 3: Refactor `SetupController@runMigration`**

In `app/Http/Controllers/SetupController.php`:

```php
    public function runMigration(): JsonResponse
    {
        try {
            $connection = 'sqlite';
            $database = config('database.connections.sqlite.database', 'database/database.sqlite');

            if ($database !== ':memory:' && ! str_starts_with($database, '/')) {
                if (! is_writable(base_path())) {
                    $databasePath = storage_path('app/'.basename($database));
                } else {
                    $databasePath = base_path($database);
                }
            } else {
                $databasePath = $database;
            }

            if ($databasePath !== ':memory:') {
                $dir = dirname($databasePath);
                if (! is_dir($dir)) {
                    @mkdir($dir, 0755, true);
                }
                if (! file_exists($databasePath)) {
                    @touch($databasePath);
                }
            }

            config([
                'database.default' => 'sqlite',
                'database.connections.sqlite.database' => $databasePath,
            ]);
            DB::purge('sqlite');
            DB::reconnect('sqlite');

            Artisan::call('migrate:fresh', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);

            return response()->json([
                'success' => true,
                'message' => __('setup.migrate_success'),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('setup.migrate_failed', ['error' => $e->getMessage()]),
            ], 500);
        }
    }
```

- [ ] **Step 4: Run test to confirm success**

Run: `php artisan test --compact --filter=DesktopSetupTest`
Expected: PASS

- [ ] **Step 5: Format PHP code using Pint & Commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/SetupController.php tests/Feature/Setup/DesktopSetupTest.php
git commit -m "refactor: simplify SetupController runMigration for SQLite desktop environment"
```

---

### Task 3: Redesign Frontend Setup Wizard Step 1 UI (`index.tsx`)

**Files:**
- Modify: `resources/js/pages/setup/index.tsx`

**Interfaces:**
- Consumes: `SetupController.runMigration`, `SetupController.uploadMasterProduct`, `SetupController.resetMasterProduct`
- Produces: Refactored Step 1 React UI without DB forms, featuring SQLite status indicator & integrated Excel file dropzone

- [ ] **Step 1: Refactor `resources/js/pages/setup/index.tsx` Step 1 UI**

Update Step 1 rendering inside `resources/js/pages/setup/index.tsx`:

Replace the database credentials collapsible form and separate upload form with:
1. **SQLite Database Status Card**: A clean alert/card displaying `<Database className="w-5 h-5 text-emerald-500" />` with text `{t('setup.step1.sqlite_info')}` (`database/database.sqlite`).
2. **Integrated Master Product Excel Upload Area**:
   - Clean, open section with Excel upload file picker / custom file badge.
   - Allows uploading `.xlsx` / `.xls` or resetting to default catalog.
3. **Single Action Button**:
   - `<Button onClick={handleMigrate} disabled={migrating || isMigrated} className="w-full h-11 text-base shadow-sm font-semibold">`
   - Displays loading spinner when `migrating` is true.
   - Text changes to `{isMigrated ? t('setup.step1.migrated_seeded') : t('setup.step1.run_migration')}`.

- [ ] **Step 2: Check TypeScript compilation**

Run: `npm run types:check`
Expected: PASS with 0 errors

- [ ] **Step 3: Run frontend build**

Run: `npm run build`
Expected: PASS with clean bundle output

- [ ] **Step 4: Commit frontend refactoring**

```bash
git add resources/js/pages/setup/index.tsx
git commit -m "feat: redesign desktop setup wizard Step 1 with clean SQLite status and catalog upload"
```

---

### Task 4: End-to-End Verification & Pint Formatting

**Files:**
- Run full tests and check code quality.

- [ ] **Step 1: Run Pint code formatter**

Run: `vendor/bin/pint --dirty --format agent`
Expected: PASS

- [ ] **Step 2: Run feature tests**

Run: `php artisan test --compact --filter=DesktopSetupTest`
Expected: PASS

- [ ] **Step 3: Verify working tree clean**

Run: `git status`
Expected: Clean working tree

- [ ] **Step 4: Final commit (if needed)**

```bash
git status
```
