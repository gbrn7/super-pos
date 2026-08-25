# Data Purging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow Super Admins to safely purge legacy transactions, returns, profit wallet, and capital wallet data older than a specified period (1, 3, 6, or 12 months) and optimize database storage.

**Architecture:** A dedicated tab under settings in the SPA. Submits selected modules and retention period via POST request. Validates owner password. Deletes old records within a database transaction and executes `VACUUM` for SQLite.

**Tech Stack:** Laravel, React, Inertia.js, SQLite, Pest, i18next.

## Global Constraints
- Must support localization keys in Indonesian and English for all UI copy and response toasts.
- Restrict to Super Admin role.
- Requires current owner password confirmation.

---

### Task 1: Backend Purging Controller & Request

**Files:**
- Create: `app/Http/Controllers/Settings/DataManagementController.php`
- Create: `app/Http/Requests/Settings/PurgeDataRequest.php`
- Modify: `routes/web.php`
- Modify: `lang/id/message.php`
- Modify: `lang/en/message.php`

**Interfaces:**
- Consumes: None.
- Produces: `POST /settings/data-management/purge` route and logic.

- [ ] **Step 1: Create PurgeDataRequest**
  Create `app/Http/Requests/Settings/PurgeDataRequest.php`:
  ```php
  <?php

  namespace App\Http\Requests\Settings;

  use Illuminate\Foundation\Http\FormRequest;
  use Illuminate\Support\Facades\Hash;

  class PurgeDataRequest extends FormRequest
  {
      public function authorize(): bool
      {
          return $this->user()->hasRole(\App\Support\Enums\RoleEnums::SUPER_ADMIN->value);
      }

      public function rules(): array
      {
          return [
              'modules' => ['required', 'array', 'min:1'],
              'modules.*' => ['required', 'string', 'in:transactions,returns,profit_wallet,capital_wallet'],
              'retention_period' => ['required', 'string', 'in:1_month,3_months,6_months,12_months'],
              'password' => [
                  'required',
                  'string',
                  function ($attribute, $value, $fail) {
                      if (! Hash::check($value, $this->user()->password)) {
                          $fail(__('validation.current_password'));
                      }
                  },
              ],
          ];
      }
  }
  ```

- [ ] **Step 2: Create DataManagementController**
  Create `app/Http/Controllers/Settings/DataManagementController.php`:
  ```php
  <?php

  namespace App\Http\Controllers\Settings;

  use App\Http\Controllers\Controller;
  use App\Http\Requests\Settings\PurgeDataRequest;
  use Carbon\Carbon;
  use Illuminate\Http\RedirectResponse;
  use Illuminate\Support\Facades\DB;
  use Inertia\Inertia;
  use Inertia\Response;

  class DataManagementController extends Controller
  {
      public function edit(): Response
      {
          return Inertia::render('settings/data-management');
      }

      public function purge(PurgeDataRequest $request): RedirectResponse
      {
          $modules = $request->input('modules');
          $period = $request->input('retention_period');

          $months = match ($period) {
              '1_month' => 1,
              '3_months' => 3,
              '6_months' => 6,
              '12_months' => 12,
          };

          $cutoffDate = Carbon::now()->subMonths($months);

          DB::transaction(function () use ($modules, $cutoffDate) {
              if (in_array('transactions', $modules)) {
                  $transactionIds = DB::table('transactions')
                      ->where('created_at', '<', $cutoffDate)
                      ->pluck('id');

                  DB::table('transaction_details')
                      ->whereIn('transaction_id', $transactionIds)
                      ->delete();

                  DB::table('transactions')
                      ->whereIn('id', $transactionIds)
                      ->delete();
              }

              if (in_array('returns', $modules)) {
                  $returnIds = DB::table('product_returns')
                      ->where('created_at', '<', $cutoffDate)
                      ->pluck('id');

                  DB::table('return_details')
                      ->whereIn('product_return_id', $returnIds)
                      ->delete();

                  DB::table('product_returns')
                      ->whereIn('id', $returnIds)
                      ->delete();
              }

              if (in_array('profit_wallet', $modules)) {
                  DB::table('profit_wallet_transactions')
                      ->where('created_at', '<', $cutoffDate)
                      ->delete();
              }

              if (in_array('capital_wallet', $modules)) {
                  DB::table('capital_wallet_transactions')
                      ->where('created_at', '<', $cutoffDate)
                      ->delete();
              }
          });

          // Run SQLite VACUUM to free space
          DB::statement('VACUUM');

          Inertia::flash('toast', [
              'type' => 'success',
              'message' => __('message.success.data_purged'),
          ]);

          return to_route('data-management.edit');
      }
  }
  ```

- [ ] **Step 3: Define Routes**
  Add to `routes/web.php` inside the settings group:
  ```php
  Route::get('/settings/data-management', [App\Http\Controllers\Settings\DataManagementController::class, 'edit'])->name('data-management.edit');
  Route::post('/settings/data-management/purge', [App\Http\Controllers\Settings\DataManagementController::class, 'purge'])->name('data-management.purge');
  ```

- [ ] **Step 4: Add Backend Translation Strings**
  - Add to `lang/id/message.php`:
    ```php
    'success' => [
        ...
        'data_purged' => 'Data lama berhasil dibersihkan dan penyimpanan dioptimalkan.',
    ]
    ```
  - Add to `lang/en/message.php`:
    ```php
    'success' => [
        ...
        'data_purged' => 'Legacy data successfully purged and storage optimized.',
    ]
    ```

- [ ] **Step 5: Commit changes**
  ```bash
  git add app/Http/Controllers/Settings/DataManagementController.php app/Http/Requests/Settings/PurgeDataRequest.php routes/web.php lang/
  git commit -m "feat: add backend data management controller, purge request validator, and routes"
  ```

---

### Task 2: Frontend Data Management Settings Page & Translations

**Files:**
- Create: `resources/js/pages/settings/data-management.tsx`
- Modify: `resources/js/locales/id/translation.json`
- Modify: `resources/js/locales/en/translation.json`
- Modify: `resources/js/pages/settings/store.tsx` (or whatever settings navigation layout is used)

**Interfaces:**
- Consumes: `POST /settings/data-management/purge`
- Produces: Data management React UI component.

- [ ] **Step 1: Add Translations**
  - Add translations to `resources/js/locales/id/translation.json`:
    ```json
    "page": {
      "data_management": {
        "title": "Manajemen Data",
        "subtitle": "Bersihkan data lama untuk mengoptimalkan kinerja aplikasi.",
        "retention_period_label": "Pertahankan Data Sejak",
        "modules_label": "Pilih Kategori Data yang Akan Dihapus",
        "module_transactions": "Transaksi Penjualan",
        "module_returns": "Retur Barang",
        "module_profit_wallet": "Riwayat Dompet Profit",
        "module_capital_wallet": "Riwayat Dompet Modal",
        "purge_button": "Bersihkan Data Usang",
        "confirm_title": "Konfirmasi Penghapusan Permanen",
        "confirm_desc": "Tindakan ini tidak dapat dibatalkan. Seluruh data terpilih yang lebih lama dari jangka waktu yang ditentukan akan dihapus secara permanen. Masukkan kata sandi Anda untuk melanjutkan.",
        "confirm_submit": "Ya, Hapus Permanen",
        "period_options": {
          "1_month": "1 Bulan Terakhir",
          "3_months": "3 Bulan Terakhir",
          "6_months": "6 Bulan Terakhir",
          "12_months": "1 Tahun Terakhir"
        }
      }
    }
    ```
  - Add translations to `resources/js/locales/en/translation.json`:
    ```json
    "page": {
      "data_management": {
        "title": "Data Management",
        "subtitle": "Purge legacy data to optimize application performance.",
        "retention_period_label": "Keep Data Since",
        "modules_label": "Select Data Categories to Delete",
        "module_transactions": "Sales Transactions",
        "module_returns": "Product Returns",
        "module_profit_wallet": "Profit Wallet History",
        "module_capital_wallet": "Capital Wallet History",
        "purge_button": "Purge Legacy Data",
        "confirm_title": "Confirm Permanent Deletion",
        "confirm_desc": "This action cannot be undone. All selected data older than the specified period will be permanently deleted. Enter your password to continue.",
        "confirm_submit": "Yes, Delete Permanently",
        "period_options": {
          "1_month": "Past 1 Month",
          "3_months": "Past 3 Months",
          "6_months": "Past 6 Months",
          "12_months": "Past 12 Months"
        }
      }
    }
    ```

- [ ] **Step 2: Create React Page Component**
  Create `resources/js/pages/settings/data-management.tsx` with appropriate checkboxes, select inputs, password confirm modal dialog, and Inertia form submission.

- [ ] **Step 3: Update Settings Navigation Layout**
  Ensure the new tab is visible in settings sidebar links.

- [ ] **Step 4: Build Assets**
  Run: `npm run build`
  Verify: Builds without errors.

- [ ] **Step 5: Commit changes**
  ```bash
  git add resources/js/
  git commit -m "feat: implement frontend data management settings page and translations"
  ```

---

### Task 3: Feature Testing (Pest)

**Files:**
- Create: `tests/Feature/Settings/DataPurgeTest.php`

**Interfaces:**
- Consumes: Purging API endpoints.
- Produces: Test verification.

- [ ] **Step 1: Write Purging Feature Test**
  Create `tests/Feature/Settings/DataPurgeTest.php`:
  Test that validation works, password verification works, data older than the cutoff date is successfully deleted, and newer data is retained.

- [ ] **Step 2: Run Tests**
  Run: `php artisan test --filter=DataPurgeTest`
  Expected: All tests pass.

- [ ] **Step 3: Commit changes**
  ```bash
  git add tests/Feature/Settings/DataPurgeTest.php
  git commit -m "test: add feature tests for data purging settings"
  ```
