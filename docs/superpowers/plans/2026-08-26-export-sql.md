# SQL Database Export Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure, memory-efficient SQLite database export feature in raw `.sql` format accessible exclusively to Super Admins on the Data Management settings page.

**Architecture:** A route handles GET requests from Super Admins and streams the output directly to the browser. The database structure (table schemas) and records (rows) are read and outputted as SQL statements (`CREATE TABLE`, `INSERT INTO`) to minimize memory footprint.

**Tech Stack:** Laravel (PHP 8.4, Laravel 12), SQLite, Inertia React, Tailwind CSS.

## Global Constraints
- Every change must be programmatically tested.
- Do not run `vendor/bin/pint --test`, run `vendor/bin/pint --dirty --format agent` to format PHP code.
- Follow the existing directory structure and conventions.

---

### Task 1: Backend Route, Controller Logic, and Feature Tests

**Files:**
- Create: `tests/Feature/Settings/DatabaseExportTest.php`
- Modify: `routes/settings.php`
- Modify: `app/Http/Controllers/Settings/DataManagementController.php`

**Interfaces:**
- Consumes: Database schema `sqlite_schema` or `sqlite_master` to query tables and definitions.
- Produces: Streamed `.sql` response download under `data-management.export-sql` route.

- [ ] **Step 1: Write the failing tests**
  Create `tests/Feature/Settings/DatabaseExportTest.php` with tests validating that super admins can download the SQL dump, and non-super-admins receive a 403.
  ```php
  <?php

  use App\Models\User;
  use App\Support\Enums\RoleEnums;
  use Illuminate\Foundation\Testing\RefreshDatabase;
  use Spatie\Permission\Models\Role;

  uses(RefreshDatabase::class);

  beforeEach(function () {
      $this->role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
      $this->user = User::factory()->create();
      $this->user->assignRole($this->role);
  });

  test('super admin can download sql database export', function () {
      $response = $this
          ->actingAs($this->user)
          ->get(route('data-management.export-sql'));

      $response->assertOk();
      $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
      $response->assertHeader('Content-Disposition', 'attachment; filename="praktis_pos_backup_' . now()->format('Y-m-d') . '.sql"');
  });

  test('non super admin cannot download sql database export', function () {
      $regularUser = User::factory()->create();

      $response = $this
          ->actingAs($regularUser)
          ->get(route('data-management.export-sql'));

      $response->assertForbidden();
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `php artisan test --compact tests/Feature/Settings/DatabaseExportTest.php`
  Expected: FAIL with route not defined or RouteNotFoundException/NotFoundHttpException.

- [ ] **Step 3: Add the Route**
  Add the following route to `routes/settings.php` inside the `auth` and `verified` middleware group:
  ```php
  Route::get('settings/data-management/export-sql', [\App\Http\Controllers\Settings\DataManagementController::class, 'exportSql'])
      ->name('data-management.export-sql');
  ```

- [ ] **Step 4: Implement `exportSql` Controller Method**
  Add `exportSql` in `app/Http/Controllers/Settings/DataManagementController.php`:
  ```php
  use App\Support\Enums\RoleEnums;
  use Symfony\Component\HttpFoundation\StreamedResponse;
  use Illuminate\Support\Facades\DB;

  public function exportSql(): StreamedResponse
  {
      if (! auth()->user()->hasRole(RoleEnums::SUPER_ADMIN->value)) {
          abort(403);
      }

      $filename = 'praktis_pos_backup_' . now()->format('Y-m-d') . '.sql';

      return response()->stream(function () {
          $out = fopen('php://output', 'w');

          fwrite($out, "-- Praktis-Pos Database Backup\n");
          fwrite($out, "-- Date: " . now()->toDateTimeString() . "\n");
          fwrite($out, "-- Connection: " . DB::connection()->getDriverName() . "\n\n");
          fwrite($out, "PRAGMA foreign_keys = OFF;\n\n");

          // Get all tables in the SQLite database
          $tables = DB::select("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

          foreach ($tables as $table) {
              $tableName = $table->name;
              $createSql = $table->sql;

              fwrite($out, "DROP TABLE IF EXISTS `" . $tableName . "`;\n");
              fwrite($out, $createSql . ";\n\n");

              // Retrieve and stream table rows
              DB::table($tableName)->orderByRaw('1')->chunk(200, function ($rows) use ($out, $tableName) {
                  foreach ($rows as $row) {
                      $rowArray = (array) $row;
                      $columns = array_keys($rowArray);
                      $escapedColumns = array_map(fn($col) => '`' . $col . '`', $columns);

                      $escapedValues = array_map(function ($val) {
                          if ($val === null) {
                              return 'NULL';
                          }
                          return "'" . str_replace("'", "''", $val) . "'";
                      }, array_values($rowArray));

                      $insertSql = "INSERT INTO `" . $tableName . "` (" . implode(', ', $escapedColumns) . ") VALUES (" . implode(', ', $escapedValues) . ");\n";
                      fwrite($out, $insertSql);
                  }
              });

              fwrite($out, "\n");
          }

          fwrite($out, "PRAGMA foreign_keys = ON;\n");
          fclose($out);
      }, 200, [
          'Content-Type' => 'text/plain; charset=UTF-8',
          'Content-Disposition' => 'attachment; filename="' . $filename . '"',
      ]);
  }
  ```

- [ ] **Step 5: Run tests to verify they pass**
  Run: `php artisan test --compact tests/Feature/Settings/DatabaseExportTest.php`
  Expected: PASS

- [ ] **Step 6: Run Pint Formatter**
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 7: Commit backend implementation**
  ```bash
  git add routes/settings.php app/Http/Controllers/Settings/DataManagementController.php tests/Feature/Settings/DatabaseExportTest.php
  git commit -m "feat: implement sqlite database export stream and add tests"
  ```

---

### Task 2: Frontend UI Implementation and Localization

**Files:**
- Modify: `resources/js/pages/settings/data-management.tsx`
- Modify: `lang/en/page.php` (if exists, or whatever language files are present. Let's check lang directory first)

- [ ] **Step 1: Check localization files**
  Let's verify existing localization structure or add strings to `lang/en/` and `lang/id/` (or check files first).

- [ ] **Step 2: Modify Frontend Page**
  Add the Database Export section in `resources/js/pages/settings/data-management.tsx`.
  Specifically, after the button wrapper for Purge Data (around line 154):
  ```tsx
  {/* Separator */}
  <hr className="border-t border-muted/30 my-8" />

  {/* Database Export Card Section */}
  <div className="space-y-4 max-w-xl">
      <div className="space-y-1">
          <h2 className="text-lg font-medium">
              {t('page.data_management.export_title', 'Ekspor Basis Data')}
          </h2>
          <p className="text-sm text-muted-foreground">
              {t(
                  'page.data_management.export_desc',
                  'Cadangkan seluruh data dan skema aplikasi Anda ke dalam format SQL mentah. Berkas ini dapat digunakan untuk pemulihan basis data di kemudian hari.',
              )}
          </p>
      </div>

      <div className="pt-2">
          <Button
              variant="outline"
              onClick={() => {
                  window.location.href = route('data-management.export-sql');
              }}
          >
              {t('page.data_management.export_button', 'Unduh Basis Data (.sql)')}
          </Button>
      </div>
  </div>
  ```

- [ ] **Step 3: Run Linter & Formatter**
  Verify there are no eslint/typescript errors:
  Run: `npm run build` (or check if TypeScript and Vite builds without error).

- [ ] **Step 4: Commit frontend changes**
  ```bash
  git add resources/js/pages/settings/data-management.tsx
  git commit -m "feat: add database export UI section to data management settings page"
  ```
