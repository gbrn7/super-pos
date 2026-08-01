# Design Specification: SoftDeletes Unix Timestamp Column Alignment

## Overview
Application models use `$dateFormat = 'U'`, storing timestamp values as Unix integers (`unsignedBigInteger`). However, migration files used `$table->softDeletes()`, which defaults to SQL `TIMESTAMP`/`DATETIME` column types. This mismatch causes database errors during soft delete actions.

## Goal
Update all database migration files using `softDeletes()` to explicitly define `deleted_at` as `$table->unsignedBigInteger('deleted_at')->nullable()`, ensuring schema consistency with `created_at` and `updated_at`.

## Scope & Target Migrations
The following 12 migration files will be updated:
1. `database/migrations/0001_01_01_000000_create_users_table.php`
2. `database/migrations/2026_04_19_142908_create_categories_table.php`
3. `database/migrations/2026_04_19_143116_create_units_table.php`
4. `database/migrations/2026_04_19_143117_create_products_table.php`
5. `database/migrations/2026_04_19_145747_create_payment_methods_table.php`
6. `database/migrations/2026_04_19_145844_create_transactions_table.php`
7. `database/migrations/2026_04_19_150055_create_transaction_detail_table.php`
8. `database/migrations/2026_07_11_130614_create_master_products_table.php`
9. `database/migrations/2026_07_25_000001_create_profit_wallets_table.php`
10. `database/migrations/2026_07_25_000002_create_profit_wallet_transactions_table.php`
11. `database/migrations/2026_07_25_000003_create_capital_wallets_table.php`
12. `database/migrations/2026_07_25_000004_create_capital_wallet_transactions_table.php`

## Implementation Details
Replace `$table->softDeletes();` with:
```php
$table->unsignedBigInteger('deleted_at')->nullable();
```

## Verification Strategy
1. Run existing Pest test suite to ensure models and soft deletes function cleanly without timestamp format mismatch exceptions.
2. Run Laravel Pint code formatter (`vendor/bin/pint --dirty --format agent`).
