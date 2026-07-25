# Task 2 Report: Models, Repositories, and Services Scaffolding

## What was implemented
1. **Eloquent Models**:
   - Created `CapitalWallet` model (`app/Models/CapitalWallet.php`).
   - Created `CapitalWalletTransaction` model (`app/Models/CapitalWalletTransaction.php`).
   - Set up factories `CapitalWalletFactory` and `CapitalWalletTransactionFactory` for testing.
2. **Repositories**:
   - Created interface `CapitalWalletRepositoryInterface` (`app/Support/Interfaces/Repositories/CapitalWalletRepositoryInterface.php`).
   - Created implementation `CapitalWalletRepository` (`app/Repositories/CapitalWalletRepository.php`).
3. **Services**:
   - Created interface `CapitalWalletServiceInterface` (`app/Support/Interfaces/Services/CapitalWalletServiceInterface.php`).
   - Created implementation `CapitalWalletService` (`app/Services/CapitalWalletService.php`).
4. **Request Models**:
   - Created `GetCapitalWalletTransactionReqModel` (`app/Support/Models/CapitalWallet/GetCapitalWalletTransactionReqModel.php`) to parse query parameters.
5. **Enums & Translations**:
   - Created `CapitalWalletStatusEnums`, `CapitalWalletTransactionDirectionEnums`, and `CapitalWalletTransactionTypeEnums` to map statuses, directions, and transaction types.
   - Added success and error translation keys in `lang/en/message.php` and `lang/id/message.php`.
6. **Service Bindings**:
   - Bound interfaces to their implementations in `AppServiceProvider`.

## What was tested and test results
- Created Pest feature test: `tests/Feature/CapitalWallet/CapitalWalletServiceTest.php`
- Tested:
  - Wallet creation (`getOrCreateWallet`)
  - Capital injection (`inject`)
  - Sales capital recovery (`recordSalesCapital`)
  - Reinvestment from profit (`recordReinvestment`)
  - Drawdown (`drawdown`)
  - Product purchase (`purchaseProduct`)
  - Insufficient balance checks & exception throwing
  - Negative/zero amount validation
  - Listing & transaction summaries with keyword filters
- **Results**: 14 tests, 48 assertions passed.

## Files changed/created
- `app/Models/CapitalWallet.php`
- `app/Models/CapitalWalletTransaction.php`
- `app/Support/Enums/CapitalWalletStatusEnums.php`
- `app/Support/Enums/CapitalWalletTransactionDirectionEnums.php`
- `app/Support/Enums/CapitalWalletTransactionTypeEnums.php`
- `app/Support/Interfaces/Repositories/CapitalWalletRepositoryInterface.php`
- `app/Repositories/CapitalWalletRepository.php`
- `app/Support/Interfaces/Services/CapitalWalletServiceInterface.php`
- `app/Services/CapitalWalletService.php`
- `app/Support/Models/CapitalWallet/GetCapitalWalletTransactionReqModel.php`
- `database/factories/CapitalWalletFactory.php`
- `database/factories/CapitalWalletTransactionFactory.php`
- `app/Providers/AppServiceProvider.php`
- `lang/en/message.php`
- `lang/id/message.php`
- `tests/Feature/CapitalWallet/CapitalWalletServiceTest.php`

## Self-review findings
- Code structure follows the same repository/service architecture pattern as `ProfitWallet`.
- Precision floats are correctly parsed and cast.
- Database locking (`lockForUpdate()`) ensures transaction integrity when adjusting wallet balance.
- Re-run Laravel Pint formatting to match expected style guidelines.

## Issues or concerns
- None.
