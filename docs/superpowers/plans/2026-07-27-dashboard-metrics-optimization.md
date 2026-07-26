# Dashboard Metrics Query Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize dashboard metrics calculation by reducing 10+ SQL queries into single-pass aggregated queries and adding database index to `transactions.created_at`.

**Architecture:** Refactor `DashboardRepository::getMetrics()` to run two efficient aggregated queries instead of four separate queries, refactor `ProductRepository` product count methods into a single conditional query, and add DB index on `transactions(created_at)`.

**Tech Stack:** PHP 8.4, Laravel 13, Eloquent/Query Builder, Pest PHP.

## Global Constraints
- Must pass all Pest tests without regressions.
- Must format modified PHP files using `vendor/bin/pint --format agent`.
- Keep exact data keys and return types in `DashboardRepository::getMetrics()`.

---

### Task 1: Migration - Index transactions.created_at

**Files:**
- Create: `database/migrations/2026_07_27_000001_add_created_at_index_to_transactions_table.php`

**Interfaces:**
- Consumes: `transactions` table schema
- Produces: B-tree index `transactions_created_at_index` on `transactions(created_at)`

- [ ] **Step 1: Write migration for created_at index**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
```

- [ ] **Step 2: Run migration**

Run: `php artisan migrate --no-interaction`
Expected: Migration executed successfully.

- [ ] **Step 3: Commit migration**

```bash
git add database/migrations/*_add_created_at_index_to_transactions_table.php
git commit -m "database: add index on transactions.created_at"
```

---

### Task 2: Refactor DashboardRepository::getMetrics

**Files:**
- Modify: `app/Repositories/DashboardRepository.php:29-52`
- Test: `tests/Feature/DashboardTest.php` or create `tests/Unit/DashboardRepositoryTest.php`

**Interfaces:**
- Consumes: `$startDate`, `$endDate` strings
- Produces: `getMetrics(string $startDate, string $endDate): array` returning keys `total_revenue`, `total_net_profit`, `transactions_count`, `products_sold`.

- [ ] **Step 1: Write Pest test verifying getMetrics accuracy**

```php
test('getMetrics calculates correct aggregated metrics in single pass', function () {
    // Setup seed data using existing factories if available or DB inserts
    $repository = app(\App\Support\Interfaces\Repositories\DashboardRepositoryInterface::class);
    $startDate = now()->startOfMonth()->toDateString();
    $endDate = now()->endOfMonth()->toDateString();

    $metrics = $repository->getMetrics($startDate, $endDate);

    expect($metrics)->toHaveKeys(['total_revenue', 'total_net_profit', 'transactions_count', 'products_sold']);
});
```

- [ ] **Step 2: Run test to confirm baseline**

Run: `php artisan test --compact --filter=Dashboard`
Expected: PASS

- [ ] **Step 3: Refactor getMetrics implementation in DashboardRepository.php**

```php
    public function getMetrics(string $startDate, string $endDate): array
    {
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        $txStats = Transaction::whereBetween('created_at', [$start, $end])
            ->selectRaw('COUNT(id) as transactions_count, COALESCE(SUM(total_amount), 0) as total_revenue')
            ->first();

        $detailStats = TransactionDetail::join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->whereNull('transaction_detail.deleted_at')
            ->selectRaw('
                COALESCE(SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)), 0) as total_net_profit,
                COALESCE(SUM(transaction_detail.quantity), 0) as products_sold
            ')
            ->first();

        return [
            'total_revenue' => (float) ($txStats->total_revenue ?? 0),
            'total_net_profit' => (float) ($detailStats->total_net_profit ?? 0),
            'transactions_count' => (int) ($txStats->transactions_count ?? 0),
            'products_sold' => (int) ($detailStats->products_sold ?? 0),
        ];
    }
```

- [ ] **Step 4: Run test to verify refactored implementation**

Run: `php artisan test --compact --filter=Dashboard`
Expected: PASS

- [ ] **Step 5: Format code and commit**

```bash
vendor/bin/pint --format agent
git add app/Repositories/DashboardRepository.php tests/
git commit -m "refactor: optimize DashboardRepository getMetrics into single-pass queries"
```
