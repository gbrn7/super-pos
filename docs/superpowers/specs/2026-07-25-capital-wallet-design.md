# Design Specification: Capital Wallet Module (Dompet Modal)

*   **Date:** 2026-07-25
*   **Author:** Antigravity AI
*   **Status:** Pending Review

---

## 1. Problem Statement & Goals

Currently, the application tracks net profit in real-time using the `ProfitWallet` system. However, the store has no way to track and manage its active working capital (*modal*). When products are sold, the capital portion (Cost of Goods Sold / COGS) needs to be returned to a centralized capital pool to fund future inventory purchases (*kulakan*). Additionally, when owners reinvest profit or inject personal funds into the business, there is no centralized ledger to record these capital movements.

### Objectives:
*   Maintain a real-time running balance of the store's total working capital.
*   Automatically recover the capital portion (cost price * quantity) of all sold products during POS checkouts.
*   Seamlessly receive reinvested capital from the Profit Wallet.
*   Log every capital movement (recoveries, injections, drawdowns, purchase withdrawals) in an audit-friendly double-entry ledger.
*   Ensure transactional safety and row locking to prevent race conditions during concurrent POS checkouts.

---

## 2. Proposed Architecture & Schema

We will implement a double-entry ledger system using two tables: `capital_wallets` (running balance) and `capital_wallet_transactions` (ledger history). 

Timestamps will follow the project's custom convention: stored as `unsignedBigInteger` unix timestamps, using `$dateFormat = 'U'` in models.

### 2.1 Database Migrations

#### A. `capital_wallets` Migration
Stores the current wallet state, running balance, total inflow, and total outflow.
```php
Schema::create('capital_wallets', function (Blueprint $table) {
    $table->id();
    $table->decimal('balance', 15, 2)->default(0.00);
    $table->decimal('total_inflow', 15, 2)->default(0.00);
    $table->decimal('total_outflow', 15, 2)->default(0.00);
    $table->string('status')->default('active'); // active, inactive
    $table->unsignedBigInteger('created_at');
    $table->unsignedBigInteger('updated_at');
});
```

#### B. `capital_wallet_transactions` Migration
Stores the immutable ledger audit trail.
```php
Schema::create('capital_wallet_transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('capital_wallet_id')->constrained('capital_wallets')->cascadeOnDelete();
    $table->decimal('amount', 15, 2); 
    $table->enum('type', ['in', 'out']);
    $table->enum('transaction_type', [
        'sales_capital_recovery', // recovered cost from sales checkouts
        'reinvestment',           // profit reinvestment from Profit Wallet
        'capital_injection',      // manual capital deposit
        'capital_drawdown',       // manual personal drawdown
        'product_purchase'        // capital spent on buying products/inventory
    ]);
    
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

### 3.1 `CapitalWallet` Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use DateTimeInterface;

class CapitalWallet extends Model
{
    protected $fillable = ['balance', 'total_inflow', 'total_outflow', 'status'];
    protected $dateFormat = 'U';

    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CapitalWalletTransaction::class);
    }
}
```

### 3.2 `CapitalWalletTransaction` Model
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use DateTimeInterface;

class CapitalWalletTransaction extends Model
{
    protected $fillable = [
        'capital_wallet_id',
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
        return $this->belongsTo(CapitalWallet::class, 'capital_wallet_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
```

---

## 4. Key Workflows & Business Logic

All balance updates must run inside a database transaction block (`DB::transaction`) and obtain a pessimistic row lock (`lockForUpdate()`) on the `CapitalWallet` record.

### 4.1 POS Sales Checkout (Sales Capital Recovery - Inflow)
When a checkout transaction completes in `TransactionService@checkout`:
1. Calculate the total cost price of sold goods:
   `$totalCost = sum($item->cost_price * $item->quantity);`
2. If `$totalCost > 0`, fetch and lock the store's active `CapitalWallet`:
   ```php
   $wallet = CapitalWallet::where('status', 'active')->lockForUpdate()->firstOrCreate([], [
       'balance' => 0.00,
       'total_inflow' => 0.00,
       'total_outflow' => 0.00
   ]);
   ```
3. Store old balance: `$before = $wallet->balance;`
4. Calculate new balance: `$after = $before + $totalCost;`
5. Create a `CapitalWalletTransaction` log referencing the sales transaction:
   ```php
   $wallet->transactions()->create([
       'amount' => $totalCost,
       'type' => 'in',
       'transaction_type' => 'sales_capital_recovery',
       'reference_id' => $transaction->id,
       'reference_type' => get_class($transaction),
       'balance_before' => $before,
       'balance_after' => $after,
       'notes' => 'Automatic sales capital recovery from POS Checkout ' . $transaction->invoice_number,
   ]);
   ```
6. Update wallet balance and total inflow:
   `$wallet->update(['balance' => $after, 'total_inflow' => $wallet->total_inflow + $totalCost]);`

### 4.2 Profit Reinvestment Integration (Inflow)
When the user withdraws capital from the `ProfitWallet` for reinvestment (`ProfitWalletService@withdrawCapital`):
1. Capture the amount reinvested.
2. In the same transaction block, fetch and lock the `CapitalWallet`.
3. Store old balance: `$before = $wallet->balance;`
4. Calculate new balance: `$after = $before + $amount;`
5. Create a `CapitalWalletTransaction` log referencing the `ProfitWalletTransaction`:
   ```php
   $wallet->transactions()->create([
       'amount' => $amount,
       'type' => 'in',
       'transaction_type' => 'reinvestment',
       'reference_id' => $profitTransaction->id,
       'reference_type' => get_class($profitTransaction),
       'balance_before' => $before,
       'balance_after' => $after,
       'notes' => 'Profit reinvestment transfer: ' . ($notes ?? ''),
   ]);
   ```
6. Update wallet:
   `$wallet->update(['balance' => $after, 'total_inflow' => $wallet->total_inflow + $amount]);`

### 4.3 Manual Capital Actions (Injection, Drawdown, Product Purchase)
Provide clean endpoints for manual management of capital:
*   **Injection (Inflow):** Increases `balance` and `total_inflow`. Logs type `capital_injection`.
*   **Drawdown (Outflow):** Decreases `balance` and increases `total_outflow`. Validates that the current balance is sufficient. Logs type `capital_drawdown`.
*   **Product Purchase (Outflow):** Decreases `balance` and increases `total_outflow`. Used for purchasing inventory. Validates sufficient balance. Logs type `product_purchase`.

---

## 5. API Endpoints & Authorization

Permissions will be registered under Spatie Permissions and seeded in `PermissionSeeder`:
*   `read-capital-wallet`
*   `inject-capital-wallet`
*   `drawdown-capital-wallet`
*   `purchase-product-capital-wallet`

### 5.1 Route Definitions (`routes/api.php`)
```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/capital-wallet', [ApiCapitalWalletController::class, 'index'])
        ->middleware('permission:read-capital-wallet');
    Route::post('/capital-wallet/inject', [ApiCapitalWalletController::class, 'inject'])
        ->middleware('permission:inject-capital-wallet');
    Route::post('/capital-wallet/drawdown', [ApiCapitalWalletController::class, 'drawdown'])
        ->middleware('permission:drawdown-capital-wallet');
    Route::post('/capital-wallet/purchase-product', [ApiCapitalWalletController::class, 'purchaseProduct'])
        ->middleware('permission:purchase-product-capital-wallet');
});
```

---

## 6. Frontend UI Design

1.  **Sidebar Registration:** Add a "Dompet Modal" menu item under the "Keuangan" section.
2.  **Dashboard/Wallet Page:**
    *   **Summary Cards:** Current Balance, Total Inflow, Total Outflow (with responsive, sleek card layouts matching the UI pattern).
    *   **Action Buttons:** "Suntik Modal", "Tarik Modal Pribadi", "Tarik Belanja Stok" triggering responsive dialog modals.
    *   **Transactions Table:** Server-side paginated DataTable with filters for transaction type and type (in/out).
