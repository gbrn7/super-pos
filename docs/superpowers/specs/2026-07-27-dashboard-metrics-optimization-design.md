# Design Spec: Dashboard Metrics Query Optimization

## 1. Overview
Optimization of dashboard data fetching process in `DashboardService` and `DashboardRepository`. Currently, fetching dashboard metrics triggers 10+ separate SQL queries, causing latency as the database grows. This spec outlines the consolidation of queries via single-pass aggregation and indexing on transaction timestamp fields.

## 2. Architecture & Key Changes

### A. Consolidation of Core Metrics (`DashboardRepository::getMetrics`)
- Combine transaction count and total revenue into a single query on `transactions`.
- Combine net profit and total products sold into a single query on `transaction_detail` joined with `transactions`.
- **Query 1 (Transactions Aggregation)**:
  `SELECT COUNT(id) as transactions_count, COALESCE(SUM(total_amount), 0) as total_revenue FROM transactions WHERE created_at BETWEEN ? AND ? AND deleted_at IS NULL`
- **Query 2 (Transaction Details Aggregation)**:
  `SELECT COALESCE(SUM(td.quantity * (td.price - td.cost_price)), 0) as total_net_profit, COALESCE(SUM(td.quantity), 0) as products_sold FROM transaction_detail td JOIN transactions t ON td.transaction_id = t.id WHERE t.created_at BETWEEN ? AND ? AND t.deleted_at IS NULL AND td.deleted_at IS NULL`

### B. Consolidation of Product Counts (`ProductRepository`)
- Combine total product count and out-of-stock product count into a single query using conditional aggregation:
  `SELECT COUNT(*) as total_products, COUNT(CASE WHEN stock <= 0 AND is_unlimited = false THEN 1 END) as out_of_stock_products FROM products WHERE deleted_at IS NULL`

### C. Database Indexing
- Ensure `created_at` on `transactions` table has a database index to optimize range queries (`whereBetween`).
- Create a migration if `transactions.created_at` index does not exist.

## 3. Files Affected
- `app/Repositories/DashboardRepository.php`
- `app/Repositories/ProductRepository.php` (if applicable for consolidated counts)
- `app/Support/Interfaces/Repositories/ProductRepositoryInterface.php`
- `database/migrations/YYYY_MM_DD_HHMMSS_add_index_to_transactions_created_at.php`

## 4. Verification & Testing
- Unit and Feature tests for `DashboardService` / `DashboardRepository` to verify metrics accuracy before and after optimization.
- Verify zero regression in calculated revenue, net profit, transaction count, and products sold.
