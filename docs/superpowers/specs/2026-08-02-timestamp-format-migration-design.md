# Design Spec: Migration of Database Timestamps to Standard Laravel Datetime

## Overview
Currently, the application stores timestamp fields (`created_at`, `updated_at`, `deleted_at`, `email_verified_at`, `two_factor_confirmed_at`) as `unsignedBigInteger` Unix timestamps (epoch) across all database tables. The Eloquent models also enforce `protected $dateFormat = 'U';`. 

This feature standardizes all timestamp columns back to Laravel's default `TIMESTAMP` / `DATETIME` format across the entire stack: database migrations, Eloquent models, request validation rules, repository query filters, frontend datatables/filters, and dashboard metrics.

---

## 1. Architecture & Layer Changes

### A. Database Migrations
Modify all database migration files in `database/migrations/`:
- Replace `$table->unsignedBigInteger('created_at')`, `$table->unsignedBigInteger('updated_at')`, and `$table->unsignedBigInteger('deleted_at')` with `$table->timestamps()` and `$table->softDeletes()` (or `$table->timestamp()` as appropriate).
- Update special timestamp columns (e.g. `email_verified_at`, `two_factor_confirmed_at`) to use `$table->timestamp(...)`.
- Preserve indexes on `created_at` where defined (e.g., composite indexes on `transactions`).

### B. Eloquent Models
- Remove `protected $dateFormat = 'U';` from all Models:
  - `User`, `Category`, `Unit`, `Product`, `MasterProduct`, `PaymentMethod`, `Transaction`, `TransactionDetail`, `ProductReturn`, `ReturnDetail`, `ProfitWallet`, `ProfitWalletTransaction`, `CapitalWallet`, `CapitalWalletTransaction`, `Permission`, `Role`.
- Ensure standard `$casts` or Carbon date mutators operate on standard datetime objects without epoch conversion.

### C. Request Validation Models
- Update Request classes validating date range filters (`start_date`, `end_date`, `date_from`, `date_to`) to use `date` format (e.g. `Y-m-d` or `ISO 8601`) instead of `integer` / `numeric` timestamp validation.

### D. Repositories & Data Queries
- Update repository methods filtering by date range (e.g., `TransactionRepository`, `DashboardRepository`, etc.).
- Convert date range filters to Eloquent's `whereBetween`, `whereDate`, or Carbon instances (`Carbon::parse($startDate)->startOfDay()`, `Carbon::parse($endDate)->endOfDay()`).
- Refactor group-by queries on dashboard metrics that previously used epoch integer math or `FROM_UNIXTIME` to standard MySQL/SQLite date functions (`DATE(created_at)`).

### E. Frontend Components (Inertia + React)
- **Datatables**: Update date formatting functions (e.g., `dayjs`, `date-fns`, or `Intl.DateTimeFormat`) to parse standard ISO/datetime strings instead of numeric Unix timestamps.
- **Filters**: Update datepicker inputs to pass standard date strings (`YYYY-MM-DD`) in API/Inertia requests rather than epoch integers.
- **Dashboard**: Update chart series and date aggregations to expect standard date strings.

---

## 2. Testing Strategy
- Run Pest test suite (`php artisan test`) to ensure all model operations, factories, and controller endpoint assertions pass cleanly.
- Verify migrations run smoothly from scratch using `php artisan migrate:fresh --seed` (or test environment equivalents).

---

## 3. Review & Approval
Please review this design specification. Upon approval, we will proceed to write the detailed implementation plan.
