# Design Spec: Single-Fetch Transaction Iteration for Dashboard Metrics

## 1. Overview
Redesign dashboard data processing in `DashboardService` to use a single-fetch query via `TransactionRepository` followed by in-memory processing. This eliminates multiple SQL queries while keeping `DashboardRepository` existing methods intact.

## 2. Key Changes

### A. TransactionRepository & Interface
- Add method `getTransactionsForDashboard(string $startDate, string $endDate): Collection` to `TransactionRepositoryInterface` and `TransactionRepository`.
- Eager load relations: `['user', 'paymentMethod', 'details.product.category']`.

### B. DashboardService Processing
- Call `getTransactionsForDashboard($startDate, $endDate)` once.
- Execute a single loop over `$transactions` to compute:
  - `metrics` (`total_revenue`, `total_net_profit`, `transactions_count`, `products_sold`).
  - `trend_chart` (daily aggregated revenue, profit, quantity).
  - `transactions_by_payment_method` (count and total amount grouped by payment method).
  - `transactions_by_category` (amount and quantity grouped by product category).
  - `top_products` (top products by quantity sold).
- Combine with `ProductRepository` metrics (`total_products`, `out_of_stock_products`, `best_sellers`, `low_stock_products`).

### C. Backward Compatibility
- Existing `DashboardRepository` implementation remains completely intact without deleting any methods.

## 3. Files Affected
- `app/Support/Interfaces/Repositories/TransactionRepositoryInterface.php`
- `app/Repositories/TransactionRepository.php`
- `app/Services/DashboardService.php`
- `tests/Feature/DashboardTest.php`

## 4. Verification & Testing
- Run Pest tests for Dashboard (`php artisan test --compact --filter=Dashboard`) to verify identical data output.
