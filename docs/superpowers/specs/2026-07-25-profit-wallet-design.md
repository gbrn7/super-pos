# Design Specification: Profit Wallet Module

*   **Date:** 2026-07-25
*   **Author:** Antigravity AI
*   **Status:** Pending Review

---

## 1. Problem Statement & Goals

The store needs a robust system to track and manage its accumulated net profits. Currently, profits are calculated and saved in the `cash_profits` table for each POS transaction, but there is no centralized, real-time balance that tracks the total withdrawable profit or records historical financial movements (e.g., when the owner withdraws profit for personal use or reinvests it as business capital).

### Objectives:
*   Maintain a real-time running balance of the store's total net profit.
*   Record profit from all completed sales (both cash and non-cash).
*   Correctly factor in item-level and transaction-level discounts in the profit calculations.
*   Log every balance change (incoming profit, owner disbursement, capital reinvestment) in a secure, audit-friendly ledger (Double-Entry Ledger pattern).
*   Ensure transactional safety and prevent race conditions when multiple POS checkouts happen concurrently.

---

## 2. Proposed Architecture & Schema

We will implement a double-entry ledger system using two tables: `profit_wallets` (running balance) and `profit_wallet_transactions` (ledger history). 

Timestamps will follow the project's custom convention: stored as `unsignedBigInteger` unix timestamps, using `$dateFormat = 'U'` in models.

### 2.1 Database Migrations

#### A. `profit_wallets` Migration
Stores the current wallet state and running balance.
```php
Schema::create('profit_wallets', function (Blueprint $table) {
    $table->id();
    $table->decimal('balance', 15, 2)->default(0.00);
    $table->string('status')->default('active'); // active, inactive
    $table->unsignedBigInteger('created_at');
    $table->unsignedBigInteger('updated_at');
});
```

#### B. `profit_wallet_transactions` Migration
Stores the immutable ledger audit trail.
```php
Schema::create('profit_wallet_transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('profit_wallet_id')->constrained('profit_wallets')->cascadeOnDelete();
    $table->decimal('amount', 15, 2); 
    $table->enum('type', ['in', 'out']);
    $table->enum('transaction_type', ['sales_profit', 'disbursement', 'capital_withdrawal']);
    
    // Polymorphic relation to the source model
    $table->nullableMorphs('reference'); // reference_id, reference_type
    
    $table->decimal('balance_before', 15, 2);
    $table->decimal('balance_after', 15, 2);
    $table->text('notes')->nullable();
    
    $table->unsignedBigInteger('created_at');
    $table->unsignedBigInteger('updated_at');
});
```

---

## 3. Eloquent Models & Relations

### 3.1 `ProfitWallet` Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use DateTimeInterface;

class ProfitWallet extends Model
{
    protected $fillable = ['balance', 'status'];
    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ProfitWalletTransaction::class);
    }
}
```

### 3.2 `ProfitWalletTransaction` Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use DateTimeInterface;

class ProfitWalletTransaction extends Model
{
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

---

## 4. Key Workflows & Business Logic

All balance updates must run inside a database transaction block (`DB::transaction`) and obtain a pessimistic row lock (`lockForUpdate()`) on the `ProfitWallet` record.

### 4.1 POS Sales Checkout (Sales Profit - Inflow)
1. Cashier completes transaction.
2. System calculates net profit (after factoring in all item-level and transaction-level discounts):
   `$profit = $transaction->total_amount - $totalCost;`
3. Fetch and lock the store's `ProfitWallet`:
   `$wallet = ProfitWallet::where('status', 'active')->lockForUpdate()->firstOrCreate([], ['balance' => 0.00]);`
4. Store old balance: `$before = $wallet->balance;`
5. Calculate new balance: `$after = $before + $profit;`
6. Create `ProfitWalletTransaction`:
   ```php
   $wallet->transactions()->create([
       'amount' => $profit,
       'type' => 'in',
       'transaction_type' => 'sales_profit',
       'reference_id' => $transaction->id,
       'reference_type' => get_class($transaction),
       'balance_before' => $before,
       'balance_after' => $after,
   ]);
   ```
7. Save updated wallet balance: `$wallet->update(['balance' => $after]);`

### 4.2 Owner Disbursement (Payout - Outflow)
1. Owner requests withdrawal of amount `$withdrawAmount`.
2. Fetch and lock `ProfitWallet`.
3. Check availability: if `$wallet->balance < $withdrawAmount`, throw validation exception.
4. Store old balance: `$before = $wallet->balance;`
5. Calculate new balance: `$after = $before - $withdrawAmount;`
6. Create `ProfitWalletTransaction`:
   ```php
   $wallet->transactions()->create([
       'amount' => $withdrawAmount,
       'type' => 'out',
       'transaction_type' => 'disbursement',
       'reference_id' => $disbursementId, // optional
       'reference_type' => $disbursementModel, // optional
       'balance_before' => $before,
       'balance_after' => $after,
       'notes' => 'Disbursement to owner bank account',
   ]);
   ```
7. Update wallet: `$wallet->update(['balance' => $after]);`

### 4.3 Capital Reinvestment (Withdraw for Capital - Outflow)
1. Owner requests to reinvest amount `$capitalAmount` back into the business.
2. Fetch and lock `ProfitWallet`.
3. Check availability: if `$wallet->balance < $capitalAmount`, throw validation exception.
4. Store old balance: `$before = $wallet->balance;`
5. Calculate new balance: `$after = $before - $capitalAmount;`
6. Create `ProfitWalletTransaction`:
   ```php
   $wallet->transactions()->create([
       'amount' => $capitalAmount,
       'type' => 'out',
       'transaction_type' => 'capital_withdrawal',
       'reference_id' => $expenseId, // optional
       'reference_type' => $expenseModel, // optional
       'balance_before' => $before,
       'balance_after' => $after,
       'notes' => 'Withdrawal for reinvestment / business capital',
   ]);
   ```
7. Update wallet: `$wallet->update(['balance' => $after]);`

---

## 5. Testing & Verification

We will write Pest tests in `tests/Feature/ProfitWalletTest.php`:
*   **Seeder & Initialization**: Test that a wallet is automatically created or initialized with a 0.00 balance if it doesn't exist.
*   **Sales Profit Integration**: Verify that completing a sale correctly increments the wallet balance by the exact profit amount (checking item discount and general discount logic).
*   **Disbursement & Validation**: Verify that withdrawing money successfully decrements the balance, and attempting to withdraw more than the current balance throws an error.
*   **Capital Withdrawal**: Verify that capital reinvestment reduces the balance and writes a transaction log with `capital_withdrawal` type.
*   **Concurrency Test**: Verify that concurrent transactions do not result in race conditions or incorrect ledger states.
