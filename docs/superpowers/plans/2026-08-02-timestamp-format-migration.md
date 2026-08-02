# Timestamp Format Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert all timestamp columns stored as `unsignedBigInteger` Unix timestamps back to standard Laravel `datetime`/`timestamp` data types across migrations, models, DTO request models, repositories, controllers, frontend components, and dashboard metrics.

**Architecture:** Update database migrations to use `$table->timestamps()`, `$table->softDeletes()`, and `$table->timestamp()`. Remove `protected $dateFormat = 'U';` from Eloquent models. Update DTO Request Models from `?int $start_date` to `?string $start_date`. Update Repository query logic to filter standard Carbon/date instances directly instead of timestamps. Update frontend components and dashboard formatters to handle ISO date strings.

**Tech Stack:** PHP 8.4, Laravel 13, Inertia.js v3, React 19, Pest 4.

## Global Constraints

- Must run Pint formatting on modified PHP files using `vendor/bin/pint --format agent`.
- Must test changes using `php artisan test --compact`.
- All migrations must execute cleanly with `php artisan migrate:fresh --seed`.

---

### Task 1: Database Migrations Update

**Files:**
- Modify: `database/migrations/0001_01_01_000000_create_users_table.php`
- Modify: `database/migrations/2025_08_14_170933_add_two_factor_columns_to_users_table.php`
- Modify: `database/migrations/2026_04_19_142908_create_categories_table.php`
- Modify: `database/migrations/2026_04_19_143116_create_units_table.php`
- Modify: `database/migrations/2026_04_19_143117_create_products_table.php`
- Modify: `database/migrations/2026_04_19_145747_create_payment_methods_table.php`
- Modify: `database/migrations/2026_04_19_145844_create_transactions_table.php`
- Modify: `database/migrations/2026_04_19_150055_create_transaction_detail_table.php`
- Modify: `database/migrations/2026_05_16_140718_create_permission_tables.php`
- Modify: `database/migrations/2026_07_11_130614_create_master_products_table.php`
- Modify: `database/migrations/2026_07_25_000001_create_profit_wallets_table.php`
- Modify: `database/migrations/2026_07_25_000002_create_profit_wallet_transactions_table.php`
- Modify: `database/migrations/2026_07_25_000003_create_capital_wallets_table.php`
- Modify: `database/migrations/2026_07_25_000004_create_capital_wallet_transactions_table.php`
- Modify: `database/migrations/2026_07_28_000001_create_returns_table.php`
- Modify: `database/migrations/2026_07_28_000002_create_return_details_table.php`

- [ ] **Step 1: Replace `unsignedBigInteger` timestamps with `$table->timestamps()` and `$table->softDeletes()` across migration files**
- [ ] **Step 2: Run `php artisan migrate:fresh --seed` to verify schema generation**
- [ ] **Step 3: Run Pint formatter**
- [ ] **Step 4: Commit migration changes**

---

### Task 2: Eloquent Models Update

**Files:**
- Modify: `app/Models/User.php`
- Modify: `app/Models/Category.php`
- Modify: `app/Models/Unit.php`
- Modify: `app/Models/Product.php`
- Modify: `app/Models/MasterProduct.php`
- Modify: `app/Models/PaymentMethod.php`
- Modify: `app/Models/Transaction.php`
- Modify: `app/Models/TransactionDetail.php`
- Modify: `app/Models/ProductReturn.php`
- Modify: `app/Models/ReturnDetail.php`
- Modify: `app/Models/ProfitWallet.php`
- Modify: `app/Models/ProfitWalletTransaction.php`
- Modify: `app/Models/CapitalWallet.php`
- Modify: `app/Models/CapitalWalletTransaction.php`
- Modify: `app/Models/Permission.php`
- Modify: `app/Models/Role.php`

- [ ] **Step 1: Remove `protected $dateFormat = 'U';` from all listed Model classes**
- [ ] **Step 2: Run `php artisan test --compact`**
- [ ] **Step 3: Run Pint formatter**
- [ ] **Step 4: Commit model changes**

---

### Task 3: DTO Request Models & Form Requests Update

**Files:**
- Modify: `app/Support/Models/Transaction/GetTransactionReqModel.php`
- Modify: `app/Support/Models/ProductReturn/GetProductReturnReqModel.php`
- Modify: `app/Support/Models/ProfitWallet/GetProfitWalletTransactionReqModel.php`
- Modify: `app/Support/Models/CapitalWallet/GetCapitalWalletTransactionReqModel.php`
- Modify: `app/Http/Requests/Transaction/IndexTransactionRequest.php` (if exists)
- Modify: `app/Http/Requests/ProfitWallet/IndexProfitWalletRequest.php`
- Modify: `app/Http/Requests/CapitalWallet/IndexCapitalWalletRequest.php`

- [ ] **Step 1: Update DTO Request properties from `public ?int $start_date` to `public ?string $start_date`**
- [ ] **Step 2: Update request validation rules from `numeric` to `date` or `date_format:Y-m-d`**
- [ ] **Step 3: Run `php artisan test --compact`**
- [ ] **Step 4: Run Pint formatter**
- [ ] **Step 5: Commit DTO & Form Request changes**

---

### Task 4: Repositories & Services Filtering Adjustments

**Files:**
- Modify: `app/Repositories/TransactionRepository.php`
- Modify: `app/Repositories/ReturnRepository.php`
- Modify: `app/Repositories/ProfitWalletRepository.php`
- Modify: `app/Repositories/CapitalWalletRepository.php`
- Modify: `app/Services/TransactionService.php`
- Modify: `app/Services/DashboardService.php`

- [ ] **Step 1: Refactor repository date range filtering to use Carbon objects directly (`whereDate`, `whereBetween`) without converting to epoch timestamps**
- [ ] **Step 2: Refactor `TransactionService` export/date helper formatting to parse standard date objects**
- [ ] **Step 3: Run `php artisan test --compact`**
- [ ] **Step 4: Run Pint formatter**
- [ ] **Step 5: Commit Repositories and Services changes**

---

### Task 5: Dashboard Metric Aggregations & Controller Adjustments

**Files:**
- Modify: `app/Http/Controllers/Api/ApiDashboardController.php`
- Modify: `app/Services/DashboardService.php`

- [ ] **Step 1: Update Dashboard queries and group-by calculations to use standard date formatting/functions**
- [ ] **Step 2: Run `php artisan test --compact`**
- [ ] **Step 3: Run Pint formatter**
- [ ] **Step 4: Commit Dashboard adjustments**

---

### Task 6: Frontend Datatable, Filters, & Dashboard React Adjustments

**Files:**
- Search and Modify React files in `resources/js/` handling date filters or date column rendering (e.g., Transactions, Wallet, Dashboard, Returns).

- [ ] **Step 1: Locate and update date formatting functions in Datatable components to accept ISO string date formats**
- [ ] **Step 2: Update Filter inputs to send `YYYY-MM-DD` date strings instead of epoch integer timestamps**
- [ ] **Step 3: Verify frontend build with `npm run build`**
- [ ] **Step 4: Commit frontend changes**

---

### Task 7: Full System Verification

- [ ] **Step 1: Execute `php artisan migrate:fresh --seed`**
- [ ] **Step 2: Execute `php artisan test --compact` to confirm all tests pass**
- [ ] **Step 3: Execute `npm run build`**
