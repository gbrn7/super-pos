# Profit Wallet Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust Profit Wallet backend module using the Service-Repository pattern to track sales profit, disbursements, and capital reinvestment with a double-entry ledger.

**Architecture:** We will create `profit_wallets` and `profit_wallet_transactions` tables. All updates to the wallet balance will run in a database transaction with pessimistic locking, exposing methods through a `ProfitWalletRepository` and `ProfitWalletService`, injected into `TransactionService`.

**Tech Stack:** PHP 8.4, Laravel 13, Pest PHP 4 (Testing).

## Global Constraints

*   Timestamps must be stored as `unsignedBigInteger` unix timestamps in migrations and database schema, matching the project's convention (`created_at` and `updated_at`).
*   Models must override `$dateFormat = 'U'` and serializeDate method to return unix timestamp.
*   Transactions must run inside a `DB::transaction()` block with a pessimistic lock (`lockForUpdate()`) on the `ProfitWallet` record.
*   Pest PHP must be used for testing, extending `RefreshDatabase`.

---

## Tasks

### Task 1: Database Migrations and Factory Setup

**Files:**
*   Create: `database/migrations/2026_07_25_000001_create_profit_wallets_table.php`
*   Create: `database/migrations/2026_07_25_000002_create_profit_wallet_transactions_table.php`
*   Create: `database/factories/ProfitWalletFactory.php`
*   Create: `database/factories/ProfitWalletTransactionFactory.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletMigrationTest.php`

**Interfaces:**
*   Produces: Database schema and Eloquent factories.

- [ ] **Step 1: Write the migration and factory files**

`database/migrations/2026_07_25_000001_create_profit_wallets_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profit_wallets', function (Blueprint $table) {
            $table->id();
            $table->decimal('balance', 15, 2)->default(0.00);
            $table->string('status')->default('active');
            $table->unsignedBigInteger('created_at');
            $table->unsignedBigInteger('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profit_wallets');
    }
};
```

`database/migrations/2026_07_25_000002_create_profit_wallet_transactions_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profit_wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profit_wallet_id')->constrained('profit_wallets')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['in', 'out']);
            $table->enum('transaction_type', ['sales_profit', 'disbursement', 'capital_withdrawal']);
            $table->nullableMorphs('reference');
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_at');
            $table->unsignedBigInteger('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profit_wallet_transactions');
    }
};
```

`database/factories/ProfitWalletFactory.php`:
```php
<?php

namespace Database\Factories;

use App\Models\ProfitWallet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ProfitWalletFactory extends Factory
{
    protected $model = ProfitWallet::class;

    public function definition(): array
    {
        return [
            'balance' => 0.00,
            'status' => 'active',
            'created_at' => Carbon::now()->unix(),
            'updated_at' => Carbon::now()->unix(),
        ];
    }
}
```

`database/factories/ProfitWalletTransactionFactory.php`:
```php
<?php

namespace Database\Factories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ProfitWalletTransactionFactory extends Factory
{
    protected $model = ProfitWalletTransaction::class;

    public function definition(): array
    {
        return [
            'profit_wallet_id' => ProfitWallet::factory(),
            'amount' => 5000.00,
            'type' => 'in',
            'transaction_type' => 'sales_profit',
            'balance_before' => 0.00,
            'balance_after' => 5000.00,
            'notes' => 'Test Transaction',
            'created_at' => Carbon::now()->unix(),
            'updated_at' => Carbon::now()->unix(),
        ];
    }
}
```

- [ ] **Step 2: Write migration test**

`tests/Feature/ProfitWallet/ProfitWalletMigrationTest.php`:
```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('profit_wallets and profit_wallet_transactions tables have correct schema', function () {
    expect(Schema::hasTable('profit_wallets'))->toBeTrue();
    expect(Schema::hasColumns('profit_wallets', ['id', 'balance', 'status', 'created_at', 'updated_at']))->toBeTrue();

    expect(Schema::hasTable('profit_wallet_transactions'))->toBeTrue();
    expect(Schema::hasColumns('profit_wallet_transactions', [
        'id', 'profit_wallet_id', 'amount', 'type', 'transaction_type', 
        'reference_type', 'reference_id', 'balance_before', 'balance_after', 'notes', 'created_at', 'updated_at'
    ]))->toBeTrue();
});
```

- [ ] **Step 3: Run the migration test**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletMigrationTest.php --compact`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_07_25_000001_create_profit_wallets_table.php database/migrations/2026_07_25_000002_create_profit_wallet_transactions_table.php database/factories/ProfitWalletFactory.php database/factories/ProfitWalletTransactionFactory.php tests/Feature/ProfitWallet/ProfitWalletMigrationTest.php
git commit -m "feat: add migrations and factories for profit wallet"
```

---

### Task 2: Eloquent Models & Relations Setup

**Files:**
*   Create: `app/Models/ProfitWallet.php`
*   Create: `app/Models/ProfitWalletTransaction.php`
*   Modify: `app/Models/Transaction.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletModelTest.php`

**Interfaces:**
*   Consumes: Schema and factories from Task 1.
*   Produces: Eloquent Models `ProfitWallet`, `ProfitWalletTransaction`.

- [ ] **Step 1: Write the Model files**

`app/Models/ProfitWallet.php`:
```php
<?php

namespace App\Models;

use Database\Factories\ProfitWalletFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProfitWallet extends Model
{
    /** @use HasFactory<ProfitWalletFactory> */
    use HasFactory;

    protected $fillable = ['balance', 'status'];
    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ProfitWalletTransaction::class, 'profit_wallet_id');
    }
}
```

`app/Models/ProfitWalletTransaction.php`:
```php
<?php

namespace App\Models;

use Database\Factories\ProfitWalletTransactionFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ProfitWalletTransaction extends Model
{
    /** @use HasFactory<ProfitWalletTransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'profit_wallet_id',
        'amount',
        'type',
        'transaction_type',
        'reference_id',
        'reference_type',
        'balance_before',
        'balance_after',
        'notes',
    ];

    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(ProfitWallet::class, 'profit_wallet_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
```

`app/Models/Transaction.php`:
Add relation inside `Transaction` class:
```php
    public function profitWalletTransaction(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(ProfitWalletTransaction::class, 'reference');
    }
```

- [ ] **Step 2: Write tests for Model relationships and serialization**

`tests/Feature/ProfitWallet/ProfitWalletModelTest.php`:
```php
<?php

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('models support relationships and Unix date format serialization', function () {
    $wallet = ProfitWallet::factory()->create(['balance' => 1500.00]);
    $transaction = Transaction::factory()->create();

    $walletTx = ProfitWalletTransaction::factory()->create([
        'profit_wallet_id' => $wallet->id,
        'amount' => 500.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'reference_id' => $transaction->id,
        'reference_type' => get_class($transaction),
        'balance_before' => 1000.00,
        'balance_after' => 1500.00,
    ]);

    expect($wallet->transactions)->toHaveCount(1)
        ->and($wallet->transactions->first()->id)->toBe($walletTx->id);

    expect($walletTx->wallet->id)->toBe($wallet->id);
    expect($walletTx->reference->id)->toBe($transaction->id);

    // Verify timestamp custom serialization
    $serialized = $wallet->toArray();
    expect($serialized['created_at'])->toBeInteger();
});
```

- [ ] **Step 3: Run Model test**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletModelTest.php --compact`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/Models/ProfitWallet.php app/Models/ProfitWalletTransaction.php app/Models/Transaction.php tests/Feature/ProfitWallet/ProfitWalletModelTest.php
git commit -m "feat: add models and relation definitions for profit wallet"
```

---

### Task 3: Repository Pattern Setup

**Files:**
*   Create: `app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php`
*   Create: `app/Repositories/ProfitWalletRepository.php`
*   Modify: `app/Providers/AppServiceProvider.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletRepositoryTest.php`

**Interfaces:**
*   Consumes: `ProfitWallet` and `ProfitWalletTransaction` models.
*   Produces: Repository interface and class bindings.

- [ ] **Step 1: Write Repository Interface and Class**

`app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php`:
```php
<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;

interface ProfitWalletRepositoryInterface
{
    /**
     * Get the active profit wallet.
     */
    public function getActiveWallet(): ?ProfitWallet;

    /**
     * Lock the wallet for update.
     */
    public function lockWalletForUpdate(int $id): ?ProfitWallet;

    /**
     * Create a wallet.
     */
    public function createWallet(array $data): ProfitWallet;

    /**
     * Update wallet balance.
     */
    public function updateWalletBalance(ProfitWallet $wallet, float $balance): bool;

    /**
     * Record a transaction in the ledger.
     */
    public function createTransaction(array $data): ProfitWalletTransaction;
}
```

`app/Repositories/ProfitWalletRepository.php`:
```php
<?php

namespace App\Repositories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;

class ProfitWalletRepository implements ProfitWalletRepositoryInterface
{
    public function getActiveWallet(): ?ProfitWallet
    {
        return ProfitWallet::where('status', 'active')->first();
    }

    public function lockWalletForUpdate(int $id): ?ProfitWallet
    {
        return ProfitWallet::where('id', $id)->lockForUpdate()->first();
    }

    public function createWallet(array $data): ProfitWallet
    {
        return ProfitWallet::create($data);
    }

    public function updateWalletBalance(ProfitWallet $wallet, float $balance): bool
    {
        return $wallet->update(['balance' => $balance]);
    }

    public function createTransaction(array $data): ProfitWalletTransaction
    {
        return ProfitWalletTransaction::create($data);
    }
}
```

- [ ] **Step 2: Register Binding in AppServiceProvider**

Modify `app/Providers/AppServiceProvider.php`:
Add imports:
```php
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use App\Repositories\ProfitWalletRepository;
```
Register inside `register()` method:
```php
        // Profit wallet service repository
        $this->app->bind(ProfitWalletRepositoryInterface::class, ProfitWalletRepository::class);
```

- [ ] **Step 3: Write repository test**

`tests/Feature/ProfitWallet/ProfitWalletRepositoryTest.php`:
```php
<?php

use App\Models\ProfitWallet;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->repository = app(ProfitWalletRepositoryInterface::class);
});

test('repository handles wallet retrieval, creation and updates', function () {
    $wallet = $this->repository->createWallet(['balance' => 0.00, 'status' => 'active']);
    expect($wallet)->toBeInstanceOf(ProfitWallet::class);

    $found = $this->repository->getActiveWallet();
    expect($found->id)->toBe($wallet->id);

    $updated = $this->repository->updateWalletBalance($wallet, 5000.00);
    expect($updated)->toBeTrue()
        ->and($wallet->fresh()->balance)->toEqual(5000.00);
});
```

- [ ] **Step 4: Run repository test**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletRepositoryTest.php --compact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php app/Repositories/ProfitWalletRepository.php app/Providers/AppServiceProvider.php tests/Feature/ProfitWallet/ProfitWalletRepositoryTest.php
git commit -m "feat: implement and bind profit wallet repository"
```

---

### Task 4: Service Pattern Implementation

**Files:**
*   Create: `app/Support/Interfaces/Services/ProfitWalletServiceInterface.php`
*   Create: `app/Services/ProfitWalletService.php`
*   Modify: `app/Providers/AppServiceProvider.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletServiceTest.php`

**Interfaces:**
*   Consumes: `ProfitWalletRepositoryInterface`.
*   Produces: `ProfitWalletServiceInterface` and class implementation.

- [ ] **Step 1: Write Service Interface and Class**

`app/Support/Interfaces/Services/ProfitWalletServiceInterface.php`:
```php
<?php

namespace App\Support\Interfaces\Services;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;

interface ProfitWalletServiceInterface
{
    /**
     * Retrieve the active wallet, or create one if it doesn't exist.
     */
    public function getOrCreateWallet(): ProfitWallet;

    /**
     * Record profit from a sales transaction.
     */
    public function recordSalesProfit(float $profit, int $transactionId): ProfitWalletTransaction;

    /**
     * Withdraw/Disburse money to the owner's bank account.
     */
    public function disburse(float $amount, ?string $notes = null): ProfitWalletTransaction;

    /**
     * Withdraw money to reinvest as capital.
     */
    public function withdrawCapital(float $amount, ?string $notes = null): ProfitWalletTransaction;
}
```

`app/Services/ProfitWalletService.php`:
```php
<?php

namespace App\Services;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProfitWalletService implements ProfitWalletServiceInterface
{
    public function __construct(
        protected ProfitWalletRepositoryInterface $profitWalletRepository
    ) {}

    public function getOrCreateWallet(): ProfitWallet
    {
        try {
            $wallet = $this->profitWalletRepository->getActiveWallet();

            if (! $wallet) {
                $wallet = $this->profitWalletRepository->createWallet([
                    'balance' => 0.00,
                    'status' => 'active',
                ]);
            }

            return $wallet;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function recordSalesProfit(float $profit, int $transactionId): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($profit, $transactionId) {
                $baseWallet = $this->getOrCreateWallet();
                $wallet = $this->profitWalletRepository->lockWalletForUpdate($baseWallet->id);

                $before = (float) $wallet->balance;
                $after = $before + $profit;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $profit,
                    'type' => 'in',
                    'transaction_type' => 'sales_profit',
                    'reference_id' => $transactionId,
                    'reference_type' => Transaction::class,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => 'Sales profit from POS checkout',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function disburse(float $amount, ?string $notes = null): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($amount, $notes) {
                $baseWallet = $this->getOrCreateWallet();
                $wallet = $this->profitWalletRepository->lockWalletForUpdate($baseWallet->id);

                $before = (float) $wallet->balance;
                if ($before < $amount) {
                    throw new Exception('Insufficient wallet balance for disbursement.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => 'out',
                    'transaction_type' => 'disbursement',
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $notes ?? 'Disbursement to owner bank account',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function withdrawCapital(float $amount, ?string $notes = null): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($amount, $notes) {
                $baseWallet = $this->getOrCreateWallet();
                $wallet = $this->profitWalletRepository->lockWalletForUpdate($baseWallet->id);

                $before = (float) $wallet->balance;
                if ($before < $amount) {
                    throw new Exception('Insufficient wallet balance for capital withdrawal.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => 'out',
                    'transaction_type' => 'capital_withdrawal',
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $notes ?? 'Reinvestment/business capital withdrawal',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
```

- [ ] **Step 2: Register Binding in AppServiceProvider**

Modify `app/Providers/AppServiceProvider.php`:
Add imports:
```php
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Services\ProfitWalletService;
```
Register inside `register()` method:
```php
        // Profit wallet service binding
        $this->app->bind(ProfitWalletServiceInterface::class, ProfitWalletService::class);
```

- [ ] **Step 3: Write service unit tests**

`tests/Feature/ProfitWallet/ProfitWalletServiceTest.php`:
```php
<?php

use App\Models\ProfitWallet;
use App\Models\Transaction;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ProfitWalletServiceInterface::class);
});

test('service handles top-ups, disbursements, and reinvestments correctly', function () {
    $wallet = $this->service->getOrCreateWallet();
    expect($wallet->balance)->toEqual(0.00);

    $transaction = Transaction::factory()->create();

    // 1. Sales profit update
    $tx1 = $this->service->recordSalesProfit(1000.00, $transaction->id);
    expect($tx1->balance_before)->toEqual(0.00)
        ->and($tx1->balance_after)->toEqual(1000.00)
        ->and($tx1->type)->toBe('in')
        ->and($tx1->transaction_type)->toBe('sales_profit');

    expect($wallet->fresh()->balance)->toEqual(1000.00);

    // 2. Disbursement
    $tx2 = $this->service->disburse(300.00, 'Test disburse');
    expect($tx2->balance_before)->toEqual(1000.00)
        ->and($tx2->balance_after)->toEqual(700.00)
        ->and($tx2->type)->toBe('out')
        ->and($tx2->transaction_type)->toBe('disbursement');

    expect($wallet->fresh()->balance)->toEqual(700.00);

    // 3. Capital Withdrawal
    $tx3 = $this->service->withdrawCapital(200.00, 'Test capital');
    expect($tx3->balance_before)->toEqual(700.00)
        ->and($tx3->balance_after)->toEqual(500.00)
        ->and($tx3->type)->toBe('out')
        ->and($tx3->transaction_type)->toBe('capital_withdrawal');

    expect($wallet->fresh()->balance)->toEqual(500.00);
});

test('disburse throws exception on insufficient balance', function () {
    $this->service->getOrCreateWallet();
    $this->service->disburse(100.00);
})->throws(Exception::class);
```

- [ ] **Step 4: Run service tests**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletServiceTest.php --compact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Support/Interfaces/Services/ProfitWalletServiceInterface.php app/Services/ProfitWalletService.php app/Providers/AppServiceProvider.php tests/Feature/ProfitWallet/ProfitWalletServiceTest.php
git commit -m "feat: implement and bind profit wallet service"
```

---

### Task 5: Checkout integration with POS Transaction

**Files:**
*   Modify: `app/Services/TransactionService.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php`

**Interfaces:**
*   Consumes: `ProfitWalletServiceInterface` in `TransactionService`.
*   Produces: Automated profit aggregation to wallet during POS checkout.

- [ ] **Step 1: Modify TransactionService constructor and checkout method**

Modify `app/Services/TransactionService.php`:
Add import:
```php
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
```
Inject `ProfitWalletServiceInterface` in `__construct` (promoted property):
```php
    public function __construct(
        protected TransactionRepositoryInterface $transactionRepository,
        protected TransactionDetailRepositoryInterface $transactionDetailRepository,
        protected ProductRepositoryInterface $productRepository,
        protected ProfitWalletServiceInterface $profitWalletService
    ) {}
```
Modify lines inside `checkout()` method where cashProfit is saved:
Replace:
```php
                // Save net profit to cash_profits table
                $transaction->cashProfit()->create([
                    'profit' => $transaction->total_amount - $totalCost,
                ]);
```
With:
```php
                $profit = $transaction->total_amount - $totalCost;

                // Save net profit to cash_profits table
                $transaction->cashProfit()->create([
                    'profit' => $profit,
                ]);

                // Record sales profit to the store's profit wallet
                $this->profitWalletService->recordSalesProfit($profit, $transaction->id);
```

- [ ] **Step 2: Write integration test**

`tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php`:
```php
<?php

use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProfitWallet;
use App\Models\User;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(TransactionServiceInterface::class);
});

test('checkout automatically updates profit wallet', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $paymentMethod = PaymentMethod::factory()->create();
    $product = Product::factory()->create([
        'price' => 10000,
        'cost_price' => 7000,
        'stock' => 10,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    $checkoutData = [
        'payment_method_id' => $paymentMethod->id,
        'discount_amount' => 1000,
        'payment_amount' => 10000,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => 'PCS',
                'quantity' => 1,
                'price' => 10000,
                'cost_price' => 7000,
                'discount' => 0,
            ],
        ],
    ];

    $transaction = $this->service->checkout($checkoutData);

    $wallet = ProfitWallet::where('status', 'active')->first();
    expect($wallet)->not->toBeNull()
        ->and((float) $wallet->balance)->toEqual(2000.00);

    $this->assertDatabaseHas('profit_wallet_transactions', [
        'profit_wallet_id' => $wallet->id,
        'amount' => 2000.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'reference_id' => $transaction->id,
        'reference_type' => get_class($transaction),
        'balance_before' => 0.00,
        'balance_after' => 2000.00,
    ]);
});
```

- [ ] **Step 3: Run the integration tests**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php --compact`
Expected: PASS

Run all existing transaction tests to ensure no regressions:
Run: `php artisan test --compact --filter=Transaction`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add app/Services/TransactionService.php tests/Feature/ProfitWallet/ProfitWalletTransactionIntegrationTest.php
git commit -m "feat: integrate profit wallet updates into checkout flow"
```
