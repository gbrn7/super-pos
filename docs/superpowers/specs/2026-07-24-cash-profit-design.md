# Design Specification: Kas Profit (Refactoring)

This document specifies the design for changing the "Transaction Profit" module to "Kas Profit" (Profit Cash). The updated module focuses solely on tracking net profit from transactions for the store owner, removing revenue and cost (HPP) metrics.

## 1. Database Schema changes
We will delete the old `transaction_profits` table and create a new `cash_profits` table.

### Table: `cash_profits`
- `id` (bigint, primary key)
- `transaction_id` (bigint, foreign key referencing `transactions.id`, cascade on delete)
- `profit` (decimal 15,2, signed to support negative profit/loss)
- `timestamps` (`created_at`, `updated_at`)

## 2. Backend Models & Relations
- Rename model file `app/Models/TransactionProfit.php` to `app/Models/CashProfit.php`.
- Model Class: `App\Models\CashProfit`.
- In `App\Models\Transaction`, change the relation `transactionProfit()` to `cashProfit()` returning `hasOne(CashProfit::class)`.
- In `App\Models\CashProfit`, implement `transaction()` relation returning `belongsTo(Transaction::class)`.

## 3. Business Logic: Checkout Profit Integration
In `TransactionService::checkout()`, calculate the transaction profit:
$$\text{profit} = \text{total\_revenue} - \text{total\_cost}$$
and save only the `profit` record into `cash_profits` table.

## 4. API & Web Controllers
- Rename `ApiProfitReportController` to `ApiCashProfitController`.
- Rename `ProfitReportController` to `CashProfitController`.
- **API Endpoint**: `GET /api/cash-profit`
  - Returns paginated list of profits. Columns included: `invoice_number`, `created_at`, `cashier_name`, `payment_method_name`, and `profit`.
  - Returns summary: `total_net_profit` (sum of all filtered transaction profits), `total_transactions` (count of all filtered transactions).
- **Web Endpoint**: `GET /cash-profit`
  - Returns Inertia view `'cash-profit/index'`.

## 5. Security & Authorization
- Rename the permission enum from `READ_TRANSACTION_PROFIT` to `READ_CASH_PROFIT` (value: `read-cash-profit`).
- Protect `/cash-profit` and `/api/cash-profit` routes using `permission:read-cash-profit` middleware.

## 6. Frontend UI/UX
- Directory: `resources/js/pages/cash-profit/`.
- **Index Page (`index.tsx`)**:
  - Displays Header: "Kas Profit".
  - Displays exactly **one summary card**: "Total Kas Profit" (renders `summary.total_net_profit`).
  - Renders `<DataTable />`.
- **DataTable (`data-table.tsx`)**:
  - Filters by invoice keyword, cashier user, payment method, and date range.
  - Controls pagination and server-side ordering.
- **Columns (`columns.tsx`)**:
  - Columns: No. Invoice (clickable to view detail receipt), Tanggal & Waktu, Kasir, Metode Bayar, Keuntungan (Net Profit).
  - Total Penjualan (revenue) and Total Modal/HPP (cost) columns are removed.
- **Sidebar (`app-sidebar.tsx`)**:
  - Rename sidebar label to "Kas Profit" (route: `cash-profit.index`, permission: `read-cash-profit`).
