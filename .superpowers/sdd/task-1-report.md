# Task 1 Report: Database Migrations, Seeding, and Spatie Permissions

## What was implemented
1. **Database Migrations:**
   - Created `2026_07_25_000003_create_capital_wallets_table.php` to store the active working capital balance, total inflow, and total outflow, with a default `active` record initialized.
   - Created `2026_07_25_000004_create_capital_wallet_transactions_table.php` to serve as the double-entry audit ledger for capital movements, linking to the wallet and storing fields like amount, type, transaction_type, polymorphic reference, balance_before, balance_after, and notes.
2. **Spatie Permissions & Enums:**
   - Created `app/Support/Enums/CapitalWalletPermissionEnums.php` containing the 4 permissions:
     - `read-capital-wallet`
     - `inject-capital-wallet`
     - `drawdown-capital-wallet`
     - `purchase-product-capital-wallet`
   - Modified `database/seeders/PermissionSeeder.php` to import and register the new permissions under the `admin` role.

## What was tested and test results
- Created `tests/Feature/CapitalWallet/CapitalWalletPermissionTest.php` to verify:
  - The `capital_wallets` table exists and contains the default `active` wallet record with a `0.00` balance.
  - The permissions are correctly seeded in the database.
  - The `admin` role is successfully assigned all four capital wallet permissions.
- Ran tests via `php artisan test --compact --filter=CapitalWalletPermissionTest`.
- **Result:** Pass (2 tests, 11 assertions).

## Files changed
- `app/Support/Enums/CapitalWalletPermissionEnums.php` (Created)
- `database/migrations/2026_07_25_000003_create_capital_wallets_table.php` (Created)
- `database/migrations/2026_07_25_000004_create_capital_wallet_transactions_table.php` (Created)
- `database/seeders/PermissionSeeder.php` (Modified)
- `tests/Feature/CapitalWallet/CapitalWalletPermissionTest.php` (Created)

## Self-review findings
- Migrations align with the project's signature unix timestamps (`unsignedBigInteger` for `created_at` and `updated_at`).
- Seeders follow the exact enum-based pattern used by sibling modules like `ProfitWallet`.
- Permissions align with design requirements.

## Issues or concerns
- None.
