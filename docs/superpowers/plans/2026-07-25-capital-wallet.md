# Capital Wallet (Dompet Modal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Capital Wallet (Dompet Modal) module with a double-entry ledger, automatic recovery of sales HPP during checkout, integration with profit reinvestment, manual capital adjustments, and a server-side DataTable UI matching the Profit Wallet module.

**Architecture:** Double-entry ledger system using `capital_wallets` (running balance) and `capital_wallet_transactions` (immutable ledger) tables. Integrations are wrapped in database transactions (`DB::transaction`) with row locking (`lockForUpdate()`). Backend follows the Service-Repository pattern with typed Request Models.

**Tech Stack:** Laravel 13, React 19, Inertia.js v3, Tailwind CSS v4, Pest PHP v4.

## Global Constraints
*   All migrations use `unsignedBigInteger` unix timestamps for `created_at` and `updated_at`.
*   All models use `$dateFormat = 'U'` and serialize dates to integers.
*   Checkouts must run inside `DB::transaction` with row locks on wallets.
*   Run `vendor/bin/pint --dirty --format agent` to format PHP code changes.

---

### Task 1: Database Migrations, Seeding, and Spatie Permissions

**Files:**
- Create: `database/migrations/2026_07_25_000003_create_capital_wallets_table.php`
- Create: `database/migrations/2026_07_25_000004_create_capital_wallet_transactions_table.php`
- Modify: `database/seeders/PermissionSeeder.php`
- Modify: `app/Support/Enums/PermissionEnums.php` (or equivalent if exists, let's check PermissionSeeder to follow permission mapping patterns)

- [ ] **Step 1: Write migration for capital_wallets**
  Write migration structure:
  ```php
  Schema::create('capital_wallets', function (Blueprint $table) {
      $table->id();
      $table->decimal('balance', 15, 2)->default(0.00);
      $table->decimal('total_inflow', 15, 2)->default(0.00);
      $table->decimal('total_outflow', 15, 2)->default(0.00);
      $table->string('status')->default('active');
      $table->unsignedBigInteger('created_at');
      $table->unsignedBigInteger('updated_at');
  });
  ```

- [ ] **Step 2: Write migration for capital_wallet_transactions**
  Write migration structure:
  ```php
  Schema::create('capital_wallet_transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('capital_wallet_id')->constrained('capital_wallets')->cascadeOnDelete();
      $table->decimal('amount', 15, 2);
      $table->enum('type', ['in', 'out']);
      $table->enum('transaction_type', ['sales_capital_recovery', 'reinvestment', 'capital_injection', 'capital_drawdown', 'product_purchase']);
      $table->nullableMorphs('reference');
      $table->decimal('balance_before', 15, 2);
      $table->decimal('balance_after', 15, 2);
      $table->text('notes')->nullable();
      $table->unsignedBigInteger('created_at');
      $table->unsignedBigInteger('updated_at');
  });
  ```

- [ ] **Step 3: Update PermissionSeeder and Enums**
  Seed permissions: `read-capital-wallet`, `inject-capital-wallet`, `drawdown-capital-wallet`, `purchase-product-capital-wallet` for the admin role.

- [ ] **Step 4: Run Migrations and Seeder**
  Run: `php artisan migrate` and `php artisan db:seed --class=PermissionSeeder`

- [ ] **Step 5: Commit**
  Commit the database changes.

---

### Task 2: Models, Repositories, and Services Scaffolding

**Files:**
- Create: `app/Models/CapitalWallet.php`
- Create: `app/Models/CapitalWalletTransaction.php`
- Create: `app/Support/Interfaces/Repositories/CapitalWalletRepositoryInterface.php`
- Create: `app/Repositories/CapitalWalletRepository.php`
- Create: `app/Support/Interfaces/Services/CapitalWalletServiceInterface.php`
- Create: `app/Services/CapitalWalletService.php`
- Modify: `app/Providers/AppServiceProvider.php` (bind interfaces to implementations)

- [ ] **Step 1: Create Eloquent Models**
  Set up model classes with `$dateFormat = 'U'`, promotion types, and relation helpers.
  `CapitalWallet` hasMany `CapitalWalletTransaction`.
  `CapitalWalletTransaction` belongsTo `CapitalWallet` and morphsTo `reference`.

- [ ] **Step 2: Implement Repository & Service Interface & Class**
  Implement methods:
  *   `getOrCreateWallet()` (locks wallet row for update, creates if doesn't exist).
  *   `recordSalesCapital(float $amount, int $transactionId)`
  *   `recordReinvestment(float $amount, int $profitWalletTransactionId)`
  *   `inject(float $amount, ?string $notes)`
  *   `drawdown(float $amount, ?string $notes)`
  *   `purchaseProduct(float $amount, ?string $notes)`
  *   `getTransactions(GetCapitalWalletTransactionReqModel $request)` (paginated search/listing)
  *   `getTransactionSummary(GetCapitalWalletTransactionReqModel $request)`

- [ ] **Step 3: Bind Repository and Service in AppServiceProvider**
  Bind interfaces in `AppServiceProvider@register`.

- [ ] **Step 4: Write Unit/Integration test**
  Write tests in `tests/Feature/CapitalWalletServiceTest.php` to verify inflow/outflow logic.

- [ ] **Step 5: Commit**
  Commit the repository and service changes.

---

### Task 3: Integrations with POS Checkout & Profit Reinvestment

**Files:**
- Modify: `app/Services/TransactionService.php` (inject HPP to CapitalWallet during POS checkout)
- Modify: `app/Services/ProfitWalletService.php` (reinvestment transfer into CapitalWallet)

- [ ] **Step 1: Modify POS Checkout flow**
  In `TransactionService@checkout`, add the Capital Wallet call:
  ```php
  $totalCost = 0;
  foreach ($validatedItems as $validated) {
      // ... HPP calculation
      $totalCost += $item['cost_price'] * $item['quantity'];
  }
  // At the end of the transaction:
  if ($totalCost > 0) {
      $this->capitalWalletService->recordSalesCapital($totalCost, $transaction->id);
  }
  ```

- [ ] **Step 2: Modify Profit Reinvestment flow**
  In `ProfitWalletService@withdrawCapital`:
  ```php
  // Inside DB::transaction:
  $profitTx = $this->profitWalletRepository->createTransaction([...]);
  // ...
  // Trigger automatic reinvestment into CapitalWallet:
  $this->capitalWalletService->recordReinvestment($request->amount, $profitTx->id);
  ```

- [ ] **Step 3: Write Integration Tests**
  Write Pest feature tests verifying that checkout increases Capital Wallet balance and Profit Wallet reinvestment correctly flows capital.

- [ ] **Step 4: Commit**
  Commit integration changes.

---

### Task 4: API Layer, Controllers, and Requests Validation

**Files:**
- Create: `app/Http/Controllers/Api/ApiCapitalWalletController.php`
- Create: `app/Http/Requests/CapitalWallet/IndexCapitalWalletRequest.php`
- Create: `app/Http/Requests/CapitalWallet/InjectCapitalWalletRequest.php`
- Create: `app/Http/Requests/CapitalWallet/DrawdownCapitalWalletRequest.php`
- Create: `app/Http/Requests/CapitalWallet/PurchaseProductCapitalWalletRequest.php`
- Create: `app/Http/Resources/CapitalWalletTransactionResource.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Set up Request validation & Resource files**
  Create request validation classes ensuring correct amount formats. Create resource mapping for transaction items.

- [ ] **Step 2: Implement Controller**
  Write `ApiCapitalWalletController` with standard Inertia/Inertia-API response methods (`ResponseApi::make`). Protect methods with appropriate middleware permissions.

- [ ] **Step 3: Define routes**
  Define routes in `routes/api.php` matching design specifications.

- [ ] **Step 4: Run Pint to format files**
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 5: Commit**
  Commit backend controller changes.

---

### Task 5: Frontend Inertia Page & Navigation Menu

**Files:**
- Create: `resources/js/pages/capital-wallet/index.tsx`
- Modify: `resources/js/layouts/sidebar.tsx` (Add menu link under Keuangan)
- Modify: `resources/lang/id/message.php` & `resources/lang/en/message.php` (Translations)

- [ ] **Step 1: Implement Menu Navigation**
  Add "Dompet Modal" sidebar item under "Keuangan". Set permissions gate.

- [ ] **Step 2: Implement UI Page & Dialog Modals**
  Create dashboard summary cards and quick actions modals (Suntik, Tarik, Kulakan) using standard Tailwind classes and UI components. Add server-side DataTable for transaction history.

- [ ] **Step 3: Compile assets**
  Run `npm run build` or start development server. Run Pest tests to ensure all pass.

- [ ] **Step 4: Commit**
  Commit all changes.
