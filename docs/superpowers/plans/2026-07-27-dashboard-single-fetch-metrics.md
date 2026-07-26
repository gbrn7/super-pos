# Single-Fetch Dashboard Metrics Processing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `DashboardService` to fetch transaction data in a single query via `TransactionRepository` and aggregate metrics in-memory, without deleting `DashboardRepository`.

**Architecture:** Add `getTransactionsForDashboard` to `TransactionRepositoryInterface` & `TransactionRepository`, then update `DashboardService::getDashboardData` to iterate over the collection and compute all metric breakdowns in a single pass.

**Tech Stack:** PHP 8.4, Laravel 13, Eloquent, Pest PHP.

## Global Constraints
- Do NOT delete any methods from `DashboardRepository`.
- Must format PHP code with `vendor/bin/pint --format agent`.
- Keep exact array structure and keys in `DashboardService::getDashboardData()`.

---

### Task 1: Add getTransactionsForDashboard to TransactionRepository

**Files:**
- Modify: `app/Support/Interfaces/Repositories/TransactionRepositoryInterface.php:51`
- Modify: `app/Repositories/TransactionRepository.php:103`

**Interfaces:**
- Consumes: `$startDate`, `$endDate` strings
- Produces: `getTransactionsForDashboard(string $startDate, string $endDate): Collection` with `details.product.category` and `paymentMethod` loaded.

- [ ] **Step 1: Add method signature to TransactionRepositoryInterface**

```php
    /**
     * Get transactions with details for dashboard processing.
     */
    public function getTransactionsForDashboard(string $startDate, string $endDate): Collection;
```

- [ ] **Step 2: Implement method in TransactionRepository**

```php
    public function getTransactionsForDashboard(string $startDate, string $endDate): Collection
    {
        $start = is_numeric($startDate)
            ? Carbon::createFromTimestamp((int) $startDate)->startOfDay()->getTimestamp()
            : Carbon::parse($startDate)->startOfDay()->getTimestamp();
        $end = is_numeric($endDate)
            ? Carbon::createFromTimestamp((int) $endDate)->endOfDay()->getTimestamp()
            : Carbon::parse($endDate)->endOfDay()->getTimestamp();

        return Transaction::with(['user', 'paymentMethod', 'details.product.category'])
            ->whereBetween('created_at', [$start, $end])
            ->get();
    }
```

- [ ] **Step 3: Format code and commit**

```bash
vendor/bin/pint --format agent
git add app/Support/Interfaces/Repositories/TransactionRepositoryInterface.php app/Repositories/TransactionRepository.php
git commit -m "feat: add getTransactionsForDashboard to TransactionRepository"
```

---

### Task 2: Refactor DashboardService to Single-Fetch In-Memory Processing

**Files:**
- Modify: `app/Services/DashboardService.php:64-114`
- Test: `tests/Feature/DashboardTest.php`

**Interfaces:**
- Consumes: `$startDate`, `$endDate`, `$txPage`, `$txLimit`, `$onlyTransactions`
- Produces: Array payload for dashboard page with metrics, trend_chart, top_products, transactions_by_payment_method, transactions_by_category, etc.

- [ ] **Step 1: Update DashboardService::getDashboardData implementation**

Replace separate calls to `DashboardRepository` methods (`getMetrics`, `getTrendChart`, `getTopProducts`, `getTransactionsByPaymentMethod`, `getTransactionsByCategory`) with single-pass iteration over `$this->transactionRepository->getTransactionsForDashboard($startDate, $endDate)`.

```php
            $rawTransactions = $this->transactionRepository->getTransactionsForDashboard($startDate, $endDate);

            $totalRevenue = 0;
            $totalNetProfit = 0;
            $productsSold = 0;
            $transactionsCount = $rawTransactions->count();

            $trendData = [];
            $paymentMethodData = [];
            $categoryData = [];
            $productSalesCount = [];

            foreach ($rawTransactions as $tx) {
                $totalRevenue += (float) $tx->total_amount;
                $dateStr = Carbon::createFromTimestamp((int) $tx->created_at)->toDateString();

                if (! isset($trendData[$dateStr])) {
                    $trendData[$dateStr] = ['date' => $dateStr, 'revenue' => 0.0, 'profit' => 0.0, 'quantity' => 0];
                }
                $trendData[$dateStr]['revenue'] += (float) $tx->total_amount;

                $pmName = $tx->paymentMethod ? $tx->paymentMethod->name : 'Unknown';
                if (! isset($paymentMethodData[$pmName])) {
                    $paymentMethodData[$pmName] = ['payment_method_name' => $pmName, 'transactions_count' => 0, 'total_amount' => 0.0];
                }
                $paymentMethodData[$pmName]['transactions_count']++;
                $paymentMethodData[$pmName]['total_amount'] += (float) $tx->total_amount;

                foreach ($tx->details as $detail) {
                    $qty = (int) $detail->quantity;
                    $profit = $qty * ((float) $detail->price - (float) $detail->cost_price);

                    $productsSold += $qty;
                    $totalNetProfit += $profit;

                    $trendData[$dateStr]['profit'] += $profit;
                    $trendData[$dateStr]['quantity'] += $qty;

                    if ($detail->product) {
                        $pName = $detail->product->name;
                        if (! isset($productSalesCount[$pName])) {
                            $productSalesCount[$pName] = 0;
                        }
                        $productSalesCount[$pName] += $qty;

                        if ($detail->product->category) {
                            $catName = $detail->product->category->name;
                            if (! isset($categoryData[$catName])) {
                                $categoryData[$catName] = ['category_name' => $catName, 'total_amount' => 0.0, 'products_count' => 0];
                            }
                            $categoryData[$catName]['total_amount'] += $qty * (float) $detail->price;
                            $categoryData[$catName]['products_count'] += $qty;
                        }
                    }
                }
            }

            ksort($trendData);
            arsort($productSalesCount);

            $topProducts = collect($productSalesCount)->take(5)->map(fn ($qty, $name) => [
                'name' => $name,
                'quantity' => $qty,
            ])->values();

            $metrics = [
                'total_revenue' => (float) $totalRevenue,
                'total_net_profit' => (float) $totalNetProfit,
                'transactions_count' => (int) $transactionsCount,
                'products_sold' => (int) $productsSold,
                'total_products' => $this->productRepository->getTotalProductsCount(),
                'out_of_stock_products' => $this->productRepository->getOutOfStockProductsCount(),
            ];

            $lowStockProducts = $this->dashboardRepository->getLowStockProducts(50);
            $bestSellers = $this->productRepository->getBestSellers(50)
                ->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => (float) $product->price,
                    'sold_quantity' => (int) $product->sold_quantity,
                ]);

            return [
                'metrics' => $metrics,
                'trend_chart' => collect(array_values($trendData)),
                'top_products' => $topProducts,
                'recent_transactions' => [
                    'data' => $formattedTransactions,
                    'total' => $recentTransactionsPaginator->total(),
                    'current_page' => $recentTransactionsPaginator->currentPage(),
                    'per_page' => $recentTransactionsPaginator->perPage(),
                    'last_page' => $recentTransactionsPaginator->lastPage(),
                ],
                'transactions_by_payment_method' => collect(array_values($paymentMethodData)),
                'transactions_by_category' => collect(array_values($categoryData)),
                'low_stock_products' => $lowStockProducts->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'stock' => (int) $product->stock,
                    'price' => (float) $product->price,
                ]),
                'best_sellers' => $bestSellers,
                'filter' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ];
```

- [ ] **Step 2: Run Pest tests to verify correctness**

Run: `php artisan test --compact --filter=Dashboard`
Expected: PASS

- [ ] **Step 3: Format code and commit**

```bash
vendor/bin/pint --format agent
git add app/Services/DashboardService.php
git commit -m "refactor: use single-fetch transaction collection iteration for dashboard metrics"
```
