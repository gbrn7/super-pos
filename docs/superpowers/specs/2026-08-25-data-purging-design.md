# Design Specification: Data Management (Legacy Data Purging)

This specification outlines the architecture, database operations, UI flow, and security considerations for the Data Management feature, allowing owners to purge legacy data to optimize application size and performance.

## 1. Requirements

- **Functional:**
  - Provide a new "Data Management" tab under Settings.
  - Allow users to select which modules to clean up: Transactions, Returns, Profit Wallet, and Capital Wallet.
  - Allow selecting a global retention period: data older than 1 month, 3 months, 6 months, or 12 months.
  - Implement dynamic VACUUM to free SQLite disk space after purging.
  - Fully support English and Indonesian translations for all UI texts and server-side responses.
- **Security:**
  - Restrict access to users with the Super Admin role.
  - Require the user to confirm their current password before the purge executes.
  - Execute database purges within single transactions for integrity, dropping constraints safely if needed.

## 2. Technical Design

### Backend Changes

#### API Route
Add to `routes/web.php` or `routes/api.php` under the authenticated middleware group:
- `POST /settings/data-management/purge` -> `App\Http\Controllers\Settings\DataManagementController@purge`

#### Controller: `DataManagementController`
Create a new controller to handle rendering the UI and executing the purge process:
- `index()`: Renders the `settings/data-management` Inertia view.
- `purge(PurgeDataRequest $request)`: Validates input, checks current user's password, deletes records from selected modules older than the retention date, runs `VACUUM`, and flashes a success toast message.

#### Request Validation: `PurgeDataRequest`
Validates:
- `modules`: `required|array|min:1`
  - Elements must be in: `transactions`, `returns`, `profit_wallet`, `capital_wallet`.
- `retention_period`: `required|string|in:1_month,3_months,6_months,12_months`
- `password`: `required|string` (validated against `Hash::check($request->password, auth()->user()->password)`)

#### DB Deletion Strategy (Cutoff Date)
The cutoff date is calculated based on the `retention_period`:
- `1_month`: `now()->subMonth()`
- `3_months`: `now()->subMonths(3)`
- `6_months`: `now()->subMonths(6)`
- `12_months`: `now()->subMonths(12)`

For each selected module, SQL queries will delete records created before the cutoff date:
1. **Transactions:**
   - Delete `transaction_details` where `transaction_id` is in the targeted transactions.
   - Delete `transactions` where `created_at < cutoff`.
2. **Returns:**
   - Delete `return_details` where `product_return_id` is in the targeted returns.
   - Delete `product_returns` where `created_at < cutoff`.
3. **Profit Wallet:**
   - Delete `profit_wallet_transactions` where `created_at < cutoff`.
4. **Capital Wallet:**
   - Delete `capital_wallet_transactions` where `created_at < cutoff`.

After execution, run:
```php
DB::statement('VACUUM');
```

---

### Frontend Changes

#### Settings Layout Navigation
Add "Manajemen Data" (ID) / "Data Management" (EN) tab options to `resources/js/pages/settings/` sidebar navigation.

#### Page Component: `resources/js/pages/settings/data-management.tsx`
Create a new React component rendering:
- A form container with options.
- Dropdown select for `retention_period`.
- Multi-select checkboxes for `modules`.
- Purge button triggering a confirm dialog.
- Password verification modal dialog on confirm.

---

## 3. Localization Keys

### Indonesian (`resources/js/locales/id/translation.json`)
```json
{
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
}
```

### English (`resources/js/locales/en/translation.json`)
```json
{
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
}
```

### Backend Messages (`lang/id/message.php` & `lang/en/message.php`)
- `id`: `'data_purged' => 'Data lama berhasil dibersihkan dan penyimpanan dioptimalkan.'`
- `en`: `'data_purged' => 'Legacy data successfully purged and storage optimized.'`
