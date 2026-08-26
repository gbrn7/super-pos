# Design Spec: SQL Database Export Feature

This specification describes the design and implementation details for exporting the SQLite database into a raw `.sql` file format from the Data Management settings page.

## Purpose & Scope
Allow Super Admins to download a full backup of the application's database schema and data in standard SQL format. This is useful for data preservation, backup, and manual data restoration/inspection.

## Access & Permissions
* **Role Restriction:** Only users with the `SUPER_ADMIN` role can access this endpoint and UI section.
* **Page Location:** Placed inside the existing Data Management settings page (`settings/data-management`).

## 1. Backend Implementation

### Route
A new GET route will be added in `routes/settings.php` under the `auth` and `verified` middleware group:
```php
Route::get('settings/data-management/export-sql', [DataManagementController::class, 'exportSql'])
    ->name('data-management.export-sql');
```

### Controller Method
In `App\Http\Controllers\Settings\DataManagementController.php`, the `exportSql` method will:
1. Verify the authenticated user is a `SUPER_ADMIN`.
2. Construct a streamed response using `response()->stream(...)`.
3. Set the download headers:
   * `Content-Type: text/plain`
   * `Content-Disposition: attachment; filename="praktis_pos_backup_{date}.sql"`
4. Inside the stream generator:
   * Write introductory comments (dump info, date, connection details).
   * Temporarily disable foreign keys: `PRAGMA foreign_keys = OFF;`.
   * Fetch all table names and their creation SQL from `sqlite_schema` (excluding system tables like `sqlite_sequence` or internal tables).
   * For each table:
     * Write the `CREATE TABLE ...` statement.
     * Query data in chunks (or lazy collection) to prevent high memory usage.
     * Construct `INSERT INTO {table} (...) VALUES (...);` statement for every row.
     * Flush output buffer to stream the content immediately to the client browser.
   * Re-enable foreign keys: `PRAGMA foreign_keys = ON;`.

## 2. Frontend UI Implementation

### Page: `resources/js/pages/settings/data-management.tsx`
We will add a new visually distinct section below the existing "Purge Data" form:
* **Divider/Separator:** Adds visual clearance between the purge actions and backup actions.
* **Backup Card Section:**
  * Title: **Ekspor Basis Data (Backup)** / **Database Export (Backup)** (localized using i18n).
  * Description: Explains that this exports all schemas and records into a raw `.sql` file.
  * Button: **Unduh Basis Data (.sql)** / **Download Database (.sql)**.
  * Interaction: Triggers `window.location.href = route('data-management.export-sql')` or a simple `<a>` download link tag.

## 3. Localization
The following translation keys will be added/used:
* English:
  * `page.data_management.export_title`: "Database Export"
  * `page.data_management.export_desc`: "Backup all your application data and schema into a raw SQL format. This file can be used for future database restore."
  * `page.data_management.export_button`: "Download Database (.sql)"
* Indonesian:
  * `page.data_management.export_title`: "Ekspor Basis Data"
  * `page.data_management.export_desc`: "Cadangkan seluruh data dan skema aplikasi Anda ke dalam format SQL mentah. Berkas ini dapat digunakan untuk pemulihan basis data di kemudian hari."
  * `page.data_management.export_button`: "Unduh Basis Data (.sql)"

## 4. Security & Safety Constraints
* Only `GET` request, performing read-only queries on the database. No modifications are made.
* Memory usage is kept low via streaming/lazy chunk queries.
