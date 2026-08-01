# SoftDeletes Unix Timestamp Column Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change all database migration files using `softDeletes()` to explicitly use `$table->unsignedBigInteger('deleted_at')->nullable()` to align with model `$dateFormat = 'U'`.

**Architecture:** Update migration definitions across 12 files to create `deleted_at` as an `unsignedBigInteger` instead of SQL `TIMESTAMP`/`DATETIME`. Run test suite to verify soft deletes.

**Tech Stack:** Laravel 13, PHP 8.4, Pest PHP.

## Global Constraints

- Change `$table->softDeletes();` to `$table->unsignedBigInteger('deleted_at')->nullable();` in the specified 12 migration files.
- Ensure Laravel Pint formatting is run afterwards.

---

### Task 1: Update Core User and Catalog Migration Files

**Files:**
- Modify: `database/migrations/0001_01_01_000000_create_users_table.php:23`
- Modify: `database/migrations/2026_04_19_142908_create_categories_table.php:20`
- Modify: `database/migrations/2026_04_19_143116_create_units_table.php:20`
- Modify: `database/migrations/2026_04_19_143117_create_products_table.php:31`

- [ ] **Step 1: Update create_users_table.php**
Replace `$table->softDeletes();` with `$table->unsignedBigInteger('deleted_at')->nullable();`.

- [ ] **Step 2: Update create_categories_table.php**
Replace `$table->softDeletes();` with `$table->unsignedBigInteger('deleted_at')->nullable();`.

- [ ] **Step 3: Update create_units_table.php**
Replace `$table->softDeletes();` with `$table->unsignedBigInteger('deleted_at')->nullable();`.

- [ ] **Step 4: Update create_products_table.php**
Replace `$table->softDeletes();` with `$table->unsignedBigInteger('deleted_at')->nullable();`.

- [ ] **Step 5: Commit changes**
```bash
git add database/migrations/
git commit -m "refactor: update user, category, unit, and product migrations for unix timestamp deleted_at"
```

---

### Task 2: Update Transactions & Wallet Migration Files

**Files:**
- Modify: `database/migrations/2026_04_19_145747_create_payment_methods_table.php`
- Modify: `database/migrations/2026_04_19_145844_create_transactions_table.php`
- Modify: `database/migrations/2026_04_19_150055_create_transaction_detail_table.php`
- Modify: `database/migrations/2026_07_11_130614_create_master_products_table.php`
- Modify: `database/migrations/2026_07_25_000001_create_profit_wallets_table.php`
- Modify: `database/migrations/2026_07_25_000002_create_profit_wallet_transactions_table.php`
- Modify: `database/migrations/2026_07_25_000003_create_capital_wallets_table.php`
- Modify: `database/migrations/2026_07_25_000004_create_capital_wallet_transactions_table.php`

- [ ] **Step 1: Update payment methods, transactions, transaction details, and master products migrations**
Replace `$table->softDeletes();` with `$table->unsignedBigInteger('deleted_at')->nullable();` in all four files.

- [ ] **Step 2: Update wallet and wallet transactions migrations**
Replace `$table->softDeletes();` with `$table->unsignedBigInteger('deleted_at')->nullable();` in profit and capital wallet migration files.

- [ ] **Step 3: Commit changes**
```bash
git add database/migrations/
git commit -m "refactor: update remaining migrations to use unsignedBigInteger deleted_at"
```

---

### Task 3: Verification & Formatting

**Files:**
- Format: PHP files via Pint
- Test: Pest test suite

- [ ] **Step 1: Run Pint code formatter**
Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 2: Run Pest tests**
Run: `php artisan test --compact`

- [ ] **Step 3: Final commit**
```bash
git add .
git commit -m "style: run pint formatting"
```
