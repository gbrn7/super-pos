# Task 5: Checkout integration with POS Transaction Report

## Implementation Details
- Modified `app/Services/TransactionService.php`:
  - Imported `App\Support\Interfaces\Services\ProfitWalletServiceInterface`.
  - Injected `ProfitWalletServiceInterface $profitWalletService` into constructor via promoted property.
  - Calculated net profit (`$profit = $transaction->total_amount - $totalCost`) inside `checkout()`.
  - Called `$this->profitWalletService->recordSalesProfit($profit, $transaction->id)` within DB transaction during checkout completion.

## Testing & Results
- Created integration test `tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php` to verify automated profit wallet updates when completing a POS transaction checkout.
- Executed integration test: 1 passed (3 assertions).
- Executed all transaction tests (`--filter=Transaction`): 25 passed (50 assertions).
- Executed all profit wallet tests (`--filter=ProfitWallet`): 7 passed (38 assertions).

## TDD Evidence

### RED Phase
- **Command:** `php artisan test tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php --compact`
- **Output:**
```
  FAILED  Tests\Feature\ProfitWallet\ProfitWalletTransactionIntegrationTest > checkout automatically updates profit wallet
  Expecting null not to be null.

  at tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php:47
```
- **Why Expected:** `TransactionService::checkout()` had not yet been modified to inject `ProfitWalletServiceInterface` or call `recordSalesProfit()`, so no active `ProfitWallet` or `profit_wallet_transactions` record was created upon checkout.

### GREEN Phase
- **Command:** `php artisan test tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php --compact`
- **Output:**
```
   PASS  Tests\Feature\ProfitWallet\ProfitWalletTransactionIntegrationTest
  ✓ checkout automatically updates profit wallet                         1.70s  

  Tests:    1 passed (3 assertions)
  Duration: 1.85s
```

## Files Changed
- Modified: `app/Services/TransactionService.php`
- Created: `tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php`

## Self-Review Findings
- `TransactionService` properly records the net transaction profit in `profit_wallet_transactions` and updates `profit_wallets` balance atomically inside the database transaction block.
- Formatting verified with Laravel Pint (`vendor/bin/pint --dirty --format agent`).
- Full regression check passed with zero test failures across Transaction and ProfitWallet test suites.

## Issues or Concerns
- None.

---

## Code Review Fixes Implementation & Verification

### Findings Addressed:
1. **Exploit Prevention in `disburse()` and `withdrawCapital()` (Critical):**
   - Added validation in `app/Services/ProfitWalletService.php` to throw an `Exception` (HTTP 422) if `$amount <= 0`.
   - Prevents negative disbursement/withdrawal amounts from bypassing limit checks and artificially increasing the wallet balance.

2. **Race condition in `getOrCreateWallet()` (Important):**
   - Added `lockActiveWalletForUpdate(): ?ProfitWallet` to `ProfitWalletRepositoryInterface` and implemented it in `ProfitWalletRepository` using `ProfitWallet::where('status', 'active')->lockForUpdate()->first()`.
   - Wrapped `getOrCreateWallet()` in `DB::transaction()` context calling `lockActiveWalletForUpdate()` to guarantee atomic wallet initialization and prevent duplicate active wallet creation during concurrent transactions.

3. **Negative Profit Handling (Important):**
   - Updated `recordSalesProfit()` in `ProfitWalletService.php` to store `abs($profit)` as `amount`.
   - Set ledger entry `type = 'in'` if `$profit >= 0` and `type = 'out'` if `$profit < 0`.
   - Correctly calculated updated balance as `$after = $before + $profit` (reducing balance when profit is negative).

### TDD Evidence:

#### RED Phase (Failing Tests Added First)
- **Command:** `php artisan test --filter=ProfitWallet`
- **Results:**
  - `disburse throws exception on zero or negative amount`: Failed (Exception not thrown).
  - `withdrawCapital throws exception on zero or negative amount`: Failed (Exception not thrown).
  - `recordSalesProfit handles negative profit correctly`: Failed (Expected amount `200.0` but was `-200.0`).
  - `lockActiveWalletForUpdate`: Failed (Call to undefined method).

#### GREEN Phase (All Tests Passing)
- **Command:** `php artisan test --filter=ProfitWallet`
- **Output:**
```
   PASS  Tests\Feature\ProfitWallet\ProfitWalletMigrationTest
  ✓ profit_wallets and profit_wallet_transactions tables have correct schema structure

   PASS  Tests\Feature\ProfitWallet\ProfitWalletModelTest
  ✓ models support relationships and Unix date format serialization

   PASS  Tests\Feature\ProfitWallet\ProfitWalletRepositoryTest
  ✓ repository handles wallet retrieval, creation, locking and updates
  ✓ repository creates transactions correctly

   PASS  Tests\Feature\ProfitWallet\ProfitWalletServiceTest
  ✓ service handles top-ups, disbursements, and reinvestments correctly
  ✓ disburse throws exception on insufficient balance
  ✓ disburse throws exception on zero or negative amount with (0.0)
  ✓ disburse throws exception on zero or negative amount with (-100.0)
  ✓ withdrawCapital throws exception on zero or negative amount with (0.0)
  ✓ withdrawCapital throws exception on zero or negative amount with (-500.0)
  ✓ recordSalesProfit handles negative profit correctly

   PASS  Tests\Feature\ProfitWallet\ProfitWalletTransactionIntegrationTest
  ✓ checkout automatically updates profit wallet

  Tests:    12 passed (50 assertions)
```

### Files Modified:
- `app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php`
- `app/Repositories/ProfitWalletRepository.php`
- `app/Services/ProfitWalletService.php`
- `tests/Feature/ProfitWallet/ProfitWalletRepositoryTest.php`
- `tests/Feature/ProfitWallet/ProfitWalletServiceTest.php`

### Commit Created:
- `5d83b72b557088f8017e896a913629ae5d9c35a1` - `fix(profit-wallet): resolve security exploit, race condition, and negative profit handling`

---

## Second Reviewer Code Review Fixes Implementation & Verification

### Findings Addressed:
1. **Race Condition in Wallet Initialization (Critical):**
   - Seeded default active wallet row (`balance` = 0.00, `status` = 'active', current unix timestamps) directly inside `up()` method of `database/migrations/2026_07_25_000001_create_profit_wallets_table.php`.
   - Guaranteed an active wallet row exists upon table creation, preventing duplicate wallet creation race conditions during concurrent checkouts.

2. **Remove Redundant Row Lock Queries (Important):**
   - Updated `app/Services/ProfitWalletService.php` to use the locked `ProfitWallet` model returned by `getOrCreateWallet()` directly.
   - Removed redundant `lockWalletForUpdate($baseWallet->id)` queries in `recordSalesProfit()`, `disburse()`, and `withdrawCapital()`.

### Verification & Test Output Summary:
- **Fresh Migration:** `php artisan migrate:fresh` ran cleanly.
- **Test Suite Results:** `php artisan test --filter=ProfitWallet` passed with 12 tests, 52 assertions.


