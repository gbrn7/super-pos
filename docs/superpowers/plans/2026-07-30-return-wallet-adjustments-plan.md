# Profit and Capital Wallet Adjustments on Product Return Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically adjust (deduct) the Capital Wallet and Profit Wallet balances when a product return is processed, ensuring accurate accounting.

**Architecture:** Update the database schemas to support the new return transaction type, add `sales_return_deduction` to PHP enums, implement deduction methods in wallet services, and integrate them into `ReturnService::processReturn` within the DB transaction.

**Tech Stack:** Laravel 13, PostgreSQL, PHP 8.4, Pest PHP.

## Global Constraints
- Naming convention: Use TitleCase for Enums, camelCase for methods, and snake_case for database fields.
- Test enforcement: Every changed file must be covered by a test.
- No placeholders: All code blocks in the plan represent complete implementation guides.

---

### Task 1: Database Migration to Support New Transaction Types

**Files:**
- Create: `database/migrations/YYYY_MM_DD_HHMMSS_change_transaction_type_in_wallet_transactions_tables.php`

- [ ] **Step 1: Generate migration file**
  Run: `php artisan make:migration change_transaction_type_in_wallet_transactions_tables --no-interaction`

- [ ] **Step 2: Define migration schemas**
  Write migration code in the generated file:
  ```php
  <?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up(): void
      {
          Schema::table('capital_wallet_transactions', function (Blueprint $table) {
              $table->string('transaction_type')->change();
          });

          Schema::table('profit_wallet_transactions', function (Blueprint $table) {
              $table->string('transaction_type')->change();
          });
      }

      public function down(): void
      {
          Schema::table('capital_wallet_transactions', function (Blueprint $table) {
              $table->enum('transaction_type', ['sales_capital_recovery', 'reinvestment', 'capital_injection', 'capital_drawdown', 'product_purchase'])->change();
          });

          Schema::table('profit_wallet_transactions', function (Blueprint $table) {
              $table->enum('transaction_type', ['sales_profit', 'disbursement', 'capital_withdrawal'])->change();
          });
      }
  };
  ```

- [ ] **Step 3: Run migrations**
  Run: `php artisan migrate`
  Expected: Successful migration execution without errors.

- [ ] **Step 4: Commit**
  Run: `git add database/migrations/`
  Run: `git commit -m "migration: change transaction_type columns to string to support returns"`

---

### Task 2: Update PHP Enums

**Files:**
- Modify: `app/Support/Enums/CapitalWalletTransactionTypeEnums.php`
- Modify: `app/Support/Enums/ProfitWalletTransactionTypeEnums.php`

- [ ] **Step 1: Update CapitalWalletTransactionTypeEnums**
  Modify [CapitalWalletTransactionTypeEnums.php](file:///home/raygbrn/project/laravel/super-pos/app/Support/Enums/CapitalWalletTransactionTypeEnums.php):
  ```php
  <?php

  namespace App\Support\Enums;

  enum CapitalWalletTransactionTypeEnums: string
  {
      case SALES_CAPITAL_RECOVERY = 'sales_capital_recovery';
      case REINVESTMENT = 'reinvestment';
      case CAPITAL_INJECTION = 'capital_injection';
      case CAPITAL_DRAWDOWN = 'capital_drawdown';
      case PRODUCT_PURCHASE = 'product_purchase';
      case SALES_RETURN_DEDUCTION = 'sales_return_deduction';
  }
  ```

- [ ] **Step 2: Update ProfitWalletTransactionTypeEnums**
  Modify [ProfitWalletTransactionTypeEnums.php](file:///home/raygbrn/project/laravel/super-pos/app/Support/Enums/ProfitWalletTransactionTypeEnums.php):
  ```php
  <?php

  namespace App\Support\Enums;

  enum ProfitWalletTransactionTypeEnums: string
  {
      case SALES_PROFIT = 'sales_profit';
      case DISBURSEMENT = 'disbursement';
      case CAPITAL_WITHDRAWAL = 'capital_withdrawal';
      case SALES_RETURN_DEDUCTION = 'sales_return_deduction';
  }
  ```

- [ ] **Step 3: Commit**
  Run: `git commit -am "feat: add sales_return_deduction case to wallet transaction type enums"`

---

### Task 3: Wallet Services Update

**Files:**
- Modify: `app/Support/Interfaces/Services/CapitalWalletServiceInterface.php`
- Modify: `app/Support/Interfaces/Services/ProfitWalletServiceInterface.php`
- Modify: `app/Services/CapitalWalletService.php`
- Modify: `app/Services/ProfitWalletService.php`

- [ ] **Step 1: Add method to CapitalWalletServiceInterface**
  Modify `app/Support/Interfaces/Services/CapitalWalletServiceInterface.php` to add:
  ```php
  public function recordReturnCapitalDeduction(float $amount, int $returnId): \App\Models\CapitalWalletTransaction;
  ```

- [ ] **Step 2: Implement method in CapitalWalletService**
  Modify [CapitalWalletService.php](file:///home/raygbrn/project/laravel/super-pos/app/Services/CapitalWalletService.php):
  ```php
      public function recordReturnCapitalDeduction(float $amount, int $returnId): CapitalWalletTransaction
      {
          try {
              return DB::transaction(function () use ($amount, $returnId) {
                  if ($amount <= 0) {
                      throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), \Symfony\Component\HttpFoundation\Response::HTTP_UNPROCESSABLE_ENTITY);
                  }

                  $wallet = $this->getOrCreateWallet();

                  $before = (float) $wallet->balance;
                  $after = $before - $amount;

                  $transaction = $this->capitalWalletRepository->createTransaction([
                      'capital_wallet_id' => $wallet->id,
                      'amount' => $amount,
                      'type' => CapitalWalletTransactionDirectionEnums::OUT->value,
                      'transaction_type' => CapitalWalletTransactionTypeEnums::SALES_RETURN_DEDUCTION->value,
                      'reference_id' => $returnId,
                      'reference_type' => \App\Models\ProductReturn::class,
                      'balance_before' => $before,
                      'balance_after' => $after,
                      'notes' => 'Deduction due to product return ID: ' . $returnId,
                  ]);

                  $outflowUpdate = (float) $wallet->total_outflow + $amount;
                  $this->capitalWalletRepository->updateWalletBalance($wallet, $after, (float) $wallet->total_inflow, $outflowUpdate);

                  return $transaction;
              });
          } catch (\Throwable $th) {
              throw CheckException::Check($th);
          }
      }
  ```

- [ ] **Step 3: Add method to ProfitWalletServiceInterface**
  Modify `app/Support/Interfaces/Services/ProfitWalletServiceInterface.php` to add:
  ```php
  public function recordReturnProfitDeduction(float $amount, int $returnId): \App\Models\ProfitWalletTransaction;
  ```

- [ ] **Step 4: Implement method in ProfitWalletService**
  Modify [ProfitWalletService.php](file:///home/raygbrn/project/laravel/super-pos/app/Services/ProfitWalletService.php):
  ```php
      public function recordReturnProfitDeduction(float $amount, int $returnId): ProfitWalletTransaction
      {
          try {
              return DB::transaction(function () use ($amount, $returnId) {
                  if ($amount <= 0) {
                      throw new Exception(trans('message.error.profit_wallet.amount_must_be_greater_than_zero'), \Symfony\Component\HttpFoundation\Response::HTTP_UNPROCESSABLE_ENTITY);
                  }

                  $wallet = $this->getOrCreateWallet();

                  $before = (float) $wallet->balance;
                  $after = $before - $amount;

                  $transaction = $this->profitWalletRepository->createTransaction([
                      'profit_wallet_id' => $wallet->id,
                      'amount' => $amount,
                      'type' => ProfitWalletTransactionDirectionEnums::OUT->value,
                      'transaction_type' => ProfitWalletTransactionTypeEnums::SALES_RETURN_DEDUCTION->value,
                      'reference_id' => $returnId,
                      'reference_type' => \App\Models\ProductReturn::class,
                      'balance_before' => $before,
                      'balance_after' => $after,
                      'notes' => 'Deduction due to product return ID: ' . $returnId,
                  ]);

                  $outflowUpdate = (float) $wallet->total_outflow + $amount;
                  $this->profitWalletRepository->updateWalletBalance($wallet, $after, (float) $wallet->total_inflow, $outflowUpdate);

                  return $transaction;
              });
          } catch (\Throwable $th) {
              throw CheckException::Check($th);
          }
      }
  ```

- [ ] **Step 5: Run Pint Formatter**
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 6: Commit**
  Run: `git commit -am "feat: implement recordReturnCapitalDeduction and recordReturnProfitDeduction methods in services"`

---

### Task 4: Integrate in ReturnService

**Files:**
- Modify: `app/Services/ReturnService.php`

- [ ] **Step 1: Inject Wallet Services into ReturnService constructor**
  Modify [ReturnService.php](file:///home/raygbrn/project/laravel/super-pos/app/Services/ReturnService.php) constructor:
  ```php
      public function __construct(
          protected ReturnRepositoryInterface $returnRepository,
          protected ProductRepositoryInterface $productRepository,
          protected TransactionRepositoryInterface $transactionRepository,
          protected \App\Support\Interfaces\Services\CapitalWalletServiceInterface $capitalWalletService,
          protected \App\Support\Interfaces\Services\ProfitWalletServiceInterface $profitWalletService
      ) {}
  ```

- [ ] **Step 2: Calculate and record deductions inside processReturn**
  Modify `processReturn` method to calculate returned item costs (capital) and profit deductions, then trigger deductions:
  ```php
                  // (inside the foreach loops in processReturn where details are generated...)
                  $totalCapitalDeduction = 0;
                  $totalProfitDeduction = 0;

                  foreach ($returnDetailsData as $detail) {
                      $this->returnRepository->createDetail([
                          'return_id' => $returnModel->id,
                          'product_id' => $detail['product_id'],
                          'quantity' => $detail['quantity'],
                          'price_per_unit' => $detail['price_per_unit'],
                          'subtotal' => $detail['subtotal'],
                      ]);

                      // Get original transaction detail cost price
                      $txDetail = $transaction->transactionDetails->where('product_id', $detail['product_id'])->first();
                      $costPrice = $txDetail ? $txDetail->cost_price : 0;
                      
                      $capitalCost = $detail['quantity'] * $costPrice;
                      $profit = $detail['subtotal'] - $capitalCost;

                      $totalCapitalDeduction += $capitalCost;
                      $totalProfitDeduction += $profit;

                      // Restore Product Stock via ProductRepositoryInterface
                      $productObj = $this->productRepository->getById($detail['product_id']);
                      if ($productObj) {
                          $this->productRepository->incrementStock($productObj, $detail['quantity']);
                      }
                  }

                  if ($totalCapitalDeduction > 0) {
                      $this->capitalWalletService->recordReturnCapitalDeduction($totalCapitalDeduction, $returnModel->id);
                  }

                  if ($totalProfitDeduction > 0) {
                      $this->profitWalletService->recordReturnProfitDeduction($totalProfitDeduction, $returnModel->id);
                  }
  ```

- [ ] **Step 3: Run Pint Formatter**
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 4: Commit**
  Run: `git commit -am "feat: calculate and record wallet deductions in ReturnService"`

---

### Task 5: Testing & Verification

**Files:**
- Modify: `tests/Feature/ReturnServiceTest.php`

- [ ] **Step 1: Update ReturnServiceTest to verify balance deductions**
  Modify [ReturnServiceTest.php](file:///home/raygbrn/project/laravel/super-pos/tests/Feature/ReturnServiceTest.php) to seed wallet balances initially and check deductions and transaction entries after the return.

- [ ] **Step 2: Run tests**
  Run: `php artisan test --compact --filter=ReturnServiceTest`
  Expected: PASS

- [ ] **Step 3: Commit and verify dirty files format**
  Run: `vendor/bin/pint --dirty --format agent`
  Run: `git commit -am "test: verify return wallet deductions"`
