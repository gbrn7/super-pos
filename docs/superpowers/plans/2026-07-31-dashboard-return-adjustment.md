# Dashboard Return Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adjust all POS dashboard metrics, graphs, product best sellers, and category/payment method breakdowns to accurately deduct returned items and refund amounts.

**Architecture:** Modify `DashboardRepository` database queries to dynamically subtract returns/refunds matching the selected date range. Update `ReturnService` to decrement the product's `sold_quantity` when a return is processed.

**Tech Stack:** PHP 8.4, Laravel 13, Eloquent/Query Builder, Pest PHP testing framework.

## Global Constraints
- Do not modify transaction details or transactions destructively.
- Maintain existing codebase style conventions and formatting.
- Run Pint formatter to ensure styling rules are met.

---

### Task 1: Update Product sold_quantity on Return
**Files:**
- Modify: `app/Support/Interfaces/Repositories/ProductRepositoryInterface.php`
- Modify: `app/Repositories/ProductRepository.php`
- Modify: `app/Services/ReturnService.php`
- Test: `tests/Feature/Api/ReturnTest.php` or create `tests/Feature/Product/ProductSoldQuantityTest.php`

**Interfaces:**
- Produces: `ProductRepositoryInterface::decrementSoldQuantity(Product $product, int $quantity = 1): bool`

- [ ] **Step 1: Declare decrementSoldQuantity in ProductRepositoryInterface**
  Add the method signature to `app/Support/Interfaces/Repositories/ProductRepositoryInterface.php`:
  ```php
  /**
   * Decrement sold quantity of a product.
   */
  public function decrementSoldQuantity(Product $product, int $quantity = 1): bool;
  ```

- [ ] **Step 2: Implement decrementSoldQuantity in ProductRepository**
  Add implementation in `app/Repositories/ProductRepository.php`:
  ```php
  public function decrementSoldQuantity(Product $product, int $quantity = 1): bool
  {
      return (bool) $product->decrement('sold_quantity', $quantity);
  }
  ```

- [ ] **Step 3: Call decrementSoldQuantity in ReturnService**
  In `app/Services/ReturnService.php`'s `processReturn` method, call `decrementSoldQuantity` right next to where stock is restored:
  ```php
  // Restore Product Stock via ProductRepositoryInterface
  $productObj = $this->productRepository->getById($detail['product_id']);
  if ($productObj) {
      $this->productRepository->incrementStock($productObj, $detail['quantity']);
      $this->productRepository->decrementSoldQuantity($productObj, $detail['quantity']);
  }
  ```

- [ ] **Step 4: Verify with testing**
  Run existing tests to ensure no breakage.
  Run: `php artisan test --compact`

- [ ] **Step 5: Commit changes**
  Run: `vendor/bin/pint --dirty --format agent`
  Commit: `git commit -am "feat: update product sold_quantity on returns"`

---

### Task 2: Adjust Dashboard metrics (getMetrics)
**Files:**
- Modify: `app/Repositories/DashboardRepository.php`
- Test: `tests/Feature/Dashboard/ApiDashboardControllerTest.php`

- [ ] **Step 1: Modify getMetrics implementation**
  In `app/Repositories/DashboardRepository.php`'s `getMetrics` method, query total refunds and return details in the date range, then subtract them:
  ```php
  $start = $this->parseStartTimestamp($startDate);
  $end = $this->parseEndTimestamp($endDate);

  // Raw transactions query (existing)
  $txStats = DB::table('transactions')
      ->whereBetween('created_at', [$start, $end])
      ->whereNull('deleted_at')
      ->selectRaw('
          COUNT(id) as transactions_count,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(SUM(discount_amount), 0) as total_transaction_discount
      ')
      ->first();

  // Raw transaction detail query (existing)
  $detailStats = DB::table('transaction_detail')
      ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
      ->whereBetween('transactions.created_at', [$start, $end])
      ->whereNull('transactions.deleted_at')
      ->whereNull('transaction_detail.deleted_at')
      ->selectRaw('
          COALESCE(SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)), 0) as total_net_profit,
          COALESCE(SUM(transaction_detail.quantity * transaction_detail.cost_price), 0) as total_cost,
          COALESCE(SUM(transaction_detail.discount), 0) as total_detail_discount,
          COALESCE(SUM(transaction_detail.quantity), 0) as products_sold
      ')
      ->first();

  // New query to fetch refunds and returned quantities/cost
  $returnStats = DB::table('returns')
      ->leftJoin('return_details', 'returns.id', '=', 'return_details.return_id')
      ->leftJoin('transaction_detail', function ($join) {
          $join->on('returns.transaction_id', '=', 'transaction_detail.transaction_id')
               ->on('return_details.product_id', '=', 'transaction_detail.product_id');
      })
      ->whereBetween('returns.created_at', [$start, $end])
      ->selectRaw('
          COALESCE(SUM(returns.total_refund_amount), 0) as total_refund,
          COALESCE(SUM(return_details.quantity), 0) as returned_qty,
          COALESCE(SUM(return_details.quantity * transaction_detail.cost_price), 0) as returned_cost
      ')
      ->first();

  $totalRevenue = (float) ($txStats->total_revenue ?? 0) - (float) ($returnStats->total_refund ?? 0);
  $totalCost = (float) ($detailStats->total_cost ?? 0) - (float) ($returnStats->returned_cost ?? 0);
  $totalProfit = $totalRevenue - $totalCost;
  $totalDiscount = (float) ($txStats->total_transaction_discount ?? 0) + (float) ($detailStats->total_detail_discount ?? 0);
  $productsSold = (int) ($detailStats->products_sold ?? 0) - (int) ($returnStats->returned_qty ?? 0);

  return [
      'total_revenue' => $totalRevenue,
      'total_net_profit' => $totalProfit,
      'transactions_count' => (int) ($txStats->transactions_count ?? 0),
      'products_sold' => $productsSold,
      'revenue_breakdown' => [
          'profit' => $totalProfit,
          'cost' => $totalCost,
          'discount' => $totalDiscount,
      ],
  ];
  ```

- [ ] **Step 2: Run dashboard tests**
  Run: `php artisan test tests/Feature/Dashboard/ApiDashboardControllerTest.php --compact`

- [ ] **Step 3: Commit changes**
  Run: `vendor/bin/pint --dirty --format agent`
  Commit: `git commit -am "feat: adjust dashboard metrics query with returns"`

---

### Task 3: Adjust Dashboard Trend Chart, Top Products, Payment Methods, and Category breakdown
**Files:**
- Modify: `app/Repositories/DashboardRepository.php`
- Test: `tests/Feature/Dashboard/ApiDashboardControllerTest.php`

- [ ] **Step 1: Modify getTrendChart implementation**
  In `app/Repositories/DashboardRepository.php`'s `getTrendChart` method, merge daily transactions and daily returns:
  ```php
  $start = $this->parseStartTimestamp($startDate);
  $end = $this->parseEndTimestamp($endDate);

  // Daily Transactions
  $detailSubquery = DB::table('transaction_detail')
      ->whereNull('deleted_at')
      ->select(
          'transaction_id',
          DB::raw('SUM(quantity * cost_price) as cost'),
          DB::raw('SUM(quantity) as quantity')
      )
      ->groupBy('transaction_id');

  $txData = DB::table('transactions')
      ->leftJoinSub($detailSubquery, 'details', function ($join) {
          $join->on('transactions.id', '=', 'details.transaction_id');
      })
      ->whereBetween('transactions.created_at', [$start, $end])
      ->whereNull('transactions.deleted_at')
      ->select(
          DB::raw("to_char(to_timestamp(transactions.created_at), 'YYYY-MM-DD') as date"),
          DB::raw('COALESCE(SUM(transactions.total_amount), 0) as revenue'),
          DB::raw('COALESCE(SUM(details.cost), 0) as cost'),
          DB::raw('COALESCE(SUM(details.quantity), 0) as quantity')
      )
      ->groupBy(DB::raw("to_char(to_timestamp(transactions.created_at), 'YYYY-MM-DD')"))
      ->get();

  // Daily Returns
  $returnData = DB::table('returns')
      ->join('return_details', 'returns.id', '=', 'return_details.return_id')
      ->join('transaction_detail', function ($join) {
          $join->on('returns.transaction_id', '=', 'transaction_detail.transaction_id')
               ->on('return_details.product_id', '=', 'transaction_detail.product_id');
      })
      ->whereBetween('returns.created_at', [$start, $end])
      ->select(
          DB::raw("to_char(to_timestamp(returns.created_at), 'YYYY-MM-DD') as date"),
          DB::raw('COALESCE(SUM(returns.total_refund_amount), 0) as refund'),
          DB::raw('COALESCE(SUM(return_details.quantity * transaction_detail.cost_price), 0) as returned_cost'),
          DB::raw('COALESCE(SUM(return_details.quantity), 0) as returned_qty')
      )
      ->groupBy(DB::raw("to_char(to_timestamp(returns.created_at), 'YYYY-MM-DD')"))
      ->get()
      ->keyBy('date');

  return $txData->map(function ($item) use ($returnData) {
      $date = $item->date;
      $refund = 0;
      $returnedCost = 0;
      $returnedQty = 0;

      if ($returnData->has($date)) {
          $refund = (float) $returnData[$date]->refund;
          $returnedCost = (float) $returnData[$date]->returned_cost;
          $returnedQty = (int) $returnData[$date]->returned_qty;
      }

      $revenue = (float) $item->revenue - $refund;
      $cost = (float) $item->cost - $returnedCost;
      $quantity = (int) $item->quantity - $returnedQty;

      return [
          'date' => $date,
          'revenue' => $revenue,
          'profit' => $revenue - $cost,
          'quantity' => $quantity,
      ];
  });
  ```

- [ ] **Step 2: Modify getTopProducts implementation**
  In `app/Repositories/DashboardRepository.php`'s `getTopProducts` method, subtract returned quantities:
  ```php
  $start = $this->parseStartTimestamp($startDate);
  $end = $this->parseEndTimestamp($endDate);

  // Sold quantity
  $sales = DB::table('transaction_detail')
      ->join('products', 'transaction_detail.product_id', '=', 'products.id')
      ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
      ->whereBetween('transactions.created_at', [$start, $end])
      ->whereNull('transactions.deleted_at')
      ->whereNull('transaction_detail.deleted_at')
      ->select('transaction_detail.product_id', 'products.name', DB::raw('SUM(transaction_detail.quantity) as qty'))
      ->groupBy('transaction_detail.product_id', 'products.name');

  // Returns quantity
  $returns = DB::table('return_details')
      ->join('returns', 'return_details.return_id', '=', 'returns.id')
      ->whereBetween('returns.created_at', [$start, $end])
      ->select('return_details.product_id', DB::raw('SUM(return_details.quantity) as qty'))
      ->groupBy('return_details.product_id');

  // Final query combining both
  return DB::table('products')
      ->joinSub($sales, 's', 'products.id', '=', 's.product_id')
      ->leftJoinSub($returns, 'r', 'products.id', '=', 'r.product_id')
      ->select('s.name', DB::raw('(s.qty - COALESCE(r.qty, 0)) as quantity'))
      ->orderBy('quantity', 'desc')
      ->limit($limit)
      ->get()
      ->map(function ($item) {
          return [
              'name' => $item->name,
              'quantity' => (int) $item->quantity,
          ];
      });
  ```

- [ ] **Step 3: Modify getTransactionsByPaymentMethod implementation**
  Deduct refund amounts from payment methods:
  ```php
  $start = $this->parseStartTimestamp($startDate);
  $end = $this->parseEndTimestamp($endDate);

  $sales = DB::table('transactions')
      ->whereBetween('created_at', [$start, $end])
      ->whereNull('deleted_at')
      ->select('payment_method_id', DB::raw('COUNT(id) as count'), DB::raw('SUM(total_amount) as total'))
      ->groupBy('payment_method_id');

  $returns = DB::table('returns')
      ->join('transactions', 'returns.transaction_id', '=', 'transactions.id')
      ->whereBetween('returns.created_at', [$start, $end])
      ->select('transactions.payment_method_id', DB::raw('SUM(returns.total_refund_amount) as refund'))
      ->groupBy('transactions.payment_method_id');

  return DB::table('payment_methods')
      ->joinSub($sales, 's', 'payment_methods.id', '=', 's.payment_method_id')
      ->leftJoinSub($returns, 'r', 'payment_methods.id', '=', 'r.payment_method_id')
      ->select('payment_methods.name as payment_method_name', 's.count as transactions_count', DB::raw('(s.total - COALESCE(r.refund, 0)) as total_amount'))
      ->get()
      ->map(function ($item) {
          return [
              'payment_method_name' => $item->payment_method_name,
              'transactions_count' => (int) $item->transactions_count,
              'total_amount' => (float) $item->total_amount,
          ];
      });
  ```

- [ ] **Step 4: Modify getTransactionsByCategory implementation**
  Subtract returned quantities and amounts from category totals:
  ```php
  $start = $this->parseStartTimestamp($startDate);
  $end = $this->parseEndTimestamp($endDate);

  $sales = DB::table('transaction_detail')
      ->join('products', 'transaction_detail.product_id', '=', 'products.id')
      ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
      ->whereBetween('transactions.created_at', [$start, $end])
      ->whereNull('transactions.deleted_at')
      ->whereNull('transaction_detail.deleted_at')
      ->select('products.category_id', DB::raw('SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.discount)) as total'), DB::raw('SUM(transaction_detail.quantity) as qty'))
      ->groupBy('products.category_id');

  $returns = DB::table('return_details')
      ->join('returns', 'return_details.return_id', '=', 'returns.id')
      ->join('products', 'return_details.product_id', '=', 'products.id')
      ->whereBetween('returns.created_at', [$start, $end])
      ->select('products.category_id', DB::raw('SUM(return_details.subtotal) as refund'), DB::raw('SUM(return_details.quantity) as qty'))
      ->groupBy('products.category_id');

  return DB::table('categories')
      ->joinSub($sales, 's', 'categories.id', '=', 's.category_id')
      ->leftJoinSub($returns, 'r', 'categories.id', '=', 'r.category_id')
      ->select('categories.name as category_name', DB::raw('(s.total - COALESCE(r.refund, 0)) as total_amount'), DB::raw('(s.qty - COALESCE(r.qty, 0)) as products_count'))
      ->get()
      ->map(function ($item) {
          return [
              'category_name' => $item->category_name,
              'total_amount' => (float) $item->total_amount,
              'products_count' => (int) $item->products_count,
          ];
      });
  ```

- [ ] **Step 5: Run tests and format**
  Run: `php artisan test tests/Feature/Dashboard/ApiDashboardControllerTest.php --compact`
  Run: `vendor/bin/pint --dirty --format agent`
  Commit: `git commit -am "feat: adjust remaining dashboard query metrics with returns"`

---

### Task 4: Add Automated Feature Tests for Dashboard Returns Adjustment
**Files:**
- Create: `tests/Feature/Dashboard/DashboardReturnAdjustmentTest.php`

- [ ] **Step 1: Write dashboard return adjustment test**
  Create `tests/Feature/Dashboard/DashboardReturnAdjustmentTest.php`:
  ```php
  <?php

  use App\Models\Category;
  use App\Models\PaymentMethod;
  use App\Models\Product;
  use App\Models\ProductReturn;
  use App\Models\ReturnDetail;
  use App\Models\Transaction;
  use App\Models\TransactionDetail;
  use App\Models\User;
  use App\Support\Enums\DashboardPermissionEnums;
  use App\Models\Permission;
  use Carbon\Carbon;
  use Illuminate\Foundation\Testing\RefreshDatabase;

  uses(RefreshDatabase::class);

  test('dashboard reflects returned items correctly', function () {
      $user = User::factory()->create();
      Permission::create(['name' => DashboardPermissionEnums::READ_DASHBOARD->value]);
      $user->givePermissionTo(DashboardPermissionEnums::READ_DASHBOARD->value);

      $paymentMethod = PaymentMethod::factory()->create(['name' => 'Cash']);
      $category = Category::factory()->create(['name' => 'Electronics']);
      
      $product = Product::factory()->create([
          'name' => 'Laptop',
          'category_id' => $category->id,
          'price' => 1000.00,
          'cost_price' => 600.00,
          'stock' => 10,
          'sold_quantity' => 2,
      ]);

      // Create transaction
      $transaction = Transaction::create([
          'user_id' => $user->id,
          'payment_method_id' => $paymentMethod->id,
          'invoice_number' => 'INV-001',
          'total_amount' => 2000.00,
          'payment_amount' => 2000.00,
          'change_amount' => 0.00,
          'discount_amount' => 0.00,
          'created_at' => Carbon::now()->unix(),
      ]);

      TransactionDetail::create([
          'transaction_id' => $transaction->id,
          'product_id' => $product->id,
          'quantity' => 2,
          'price' => 1000.00,
          'cost_price' => 600.00,
          'discount' => 0.00,
      ]);

      // Process a return for 1 quantity
      $productReturn = ProductReturn::create([
          'return_number' => 'RET-001',
          'transaction_id' => $transaction->id,
          'user_id' => $user->id,
          'total_refund_amount' => 1000.00,
          'reason' => 'Defective',
          'created_at' => Carbon::now()->unix(),
      ]);

      ReturnDetail::create([
          'return_id' => $productReturn->id,
          'product_id' => $product->id,
          'quantity' => 1,
          'price_per_unit' => 1000.00,
          'subtotal' => 1000.00,
          'created_at' => Carbon::now()->unix(),
          'updated_at' => Carbon::now()->unix(),
      ]);

      // Adjust sold_quantity
      $product->decrement('sold_quantity', 1);

      $response = $this->actingAs($user)
          ->getJson(route('apiDashboard.index'));

      $response->assertStatus(200);
      $data = $response->json('data');

      // Verify metrics: total_revenue (2000 - 1000 = 1000), total_cost (1200 - 600 = 600)
      expect($data['metrics']['total_revenue'])->toEqual(1000.00);
      expect($data['metrics']['total_net_profit'])->toEqual(400.00); // 1000 - 600
      expect($data['metrics']['products_sold'])->toEqual(1);
  });
  ```

- [ ] **Step 2: Run the newly created test**
  Run: `php artisan test tests/Feature/Dashboard/DashboardReturnAdjustmentTest.php --compact`

- [ ] **Step 3: Run all tests to make sure no regressions**
  Run: `php artisan test --compact`

- [ ] **Step 4: Commit tests**
  Run: `vendor/bin/pint --dirty --format agent`
  Commit: `git commit -am "test: add dashboard return adjustment integration test"`
