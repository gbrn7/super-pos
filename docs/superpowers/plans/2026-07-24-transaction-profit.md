# Laporan Profit Transaksi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan fitur Laporan Profit transaksi dengan menyimpan data profit secara terpisah ke tabel `transaction_profits` saat checkout, serta menyediakan API laporan profit dan halaman web visual premium yang dapat diakses oleh Admin/Super Admin.

**Architecture:** 
1. Membuat tabel database baru `transaction_profits` dan model Eloquent `TransactionProfit` untuk pencatatan HPP dan Profit per transaksi.
2. Memperbarui `TransactionService::checkout` untuk menyimpan data profit setiap kali transaksi dibuat.
3. Membuat `ApiProfitReportController` dan `ProfitReportController` dengan otorisasi permission `read-transaction-profit`.
4. Membuat halaman frontend React/Inertia `resources/js/pages/profit-report` dengan visual premium (kartu ringkasan total dan tabel profit yang dapat difilter).

**Tech Stack:** Laravel 13, React 19, Inertia.js v3, Tailwind CSS v4, TypeScript, Pest PHP 4.

## Global Constraints
- Laravel framework: v13
- PHP: v8.4
- React: v19
- Inertia: v3
- Tailwind CSS: v4
- Pest PHP: v4
- Gunakan Named Routes untuk routing dan Wayfinder untuk TypeScript route helper.
- Format kode PHP dengan Laravel Pint (`vendor/bin/pint --dirty --format agent`).

---

### Task 1: Database Migration & Model untuk TransactionProfit

**Files:**
- Create: `database/migrations/2026_07_24_000000_create_transaction_profits_table.php`
- Create: `app/Models/TransactionProfit.php`
- Modify: `app/Models/Transaction.php`
- Create: `tests/Feature/Transaction/TransactionProfitModelTest.php`

**Interfaces:**
- Consumes: None
- Produces: `App\Models\TransactionProfit` model, `transaction_profits` table, and `transactionProfit()` relationship on `App\Models\Transaction`.

- [ ] **Step 1: Write the failing Pest test for the model and relationship**
  Create `tests/Feature/Transaction/TransactionProfitModelTest.php` with:
  ```php
  <?php

  use App\Models\Transaction;
  use App\Models\TransactionProfit;
  use App\Models\User;
  use App\Models\PaymentMethod;

  uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

  test('transaction has a profit relationship and correctly records profit values', function () {
      $user = User::factory()->create();
      $paymentMethod = PaymentMethod::factory()->create();

      $transaction = Transaction::create([
          'user_id' => $user->id,
          'payment_method_id' => $paymentMethod->id,
          'invoice_number' => 'INV-TEST-001',
          'total_amount' => 150000.00,
          'payment_amount' => 200000.00,
          'change_amount' => 50000.00,
          'discount_amount' => 0.00,
      ]);

      $profit = TransactionProfit::create([
          'transaction_id' => $transaction->id,
          'total_revenue' => 150000.00,
          'total_cost' => 100000.00,
          'profit' => 50000.00,
      ]);

      expect($transaction->fresh()->transactionProfit)->not->toBeNull()
          ->and($transaction->fresh()->transactionProfit->profit)->toEqual(50000.00)
          ->and($profit->transaction->id)->toEqual($transaction->id);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `php artisan test tests/Feature/Transaction/TransactionProfitModelTest.php --compact`
  Expected: FAIL with Class "App\Models\TransactionProfit" not found.

- [ ] **Step 3: Create the migration file**
  Create `database/migrations/2026_07_24_000000_create_transaction_profits_table.php` with:
  ```php
  <?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;
  use Illuminate\Support\Facades\DB;

  return new class extends Migration
  {
      public function up(): void
      {
          Schema::create('transaction_profits', function (Blueprint $table) {
              $table->id();
              $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
              $table->decimal('total_revenue', 10, 2);
              $table->decimal('total_cost', 10, 2);
              $table->decimal('profit', 10, 2);
              $table->timestamps();
          });

          // Populate historical transaction data
          $transactions = DB::table('transactions')->get();
          foreach ($transactions as $tx) {
              $totalCost = DB::table('transaction_detail')
                  ->where('transaction_id', $tx->id)
                  ->sum(DB::raw('cost_price * quantity'));

              DB::table('transaction_profits')->insert([
                  'transaction_id' => $tx->id,
                  'total_revenue' => $tx->total_amount,
                  'total_cost' => $totalCost,
                  'profit' => $tx->total_amount - $totalCost,
                  'created_at' => $tx->created_at,
                  'updated_at' => $tx->updated_at,
              ]);
          }
      }

      public function down(): void
      {
          Schema::dropIfExists('transaction_profits');
      }
  };
  ```

- [ ] **Step 4: Create the TransactionProfit model**
  Create `app/Models/TransactionProfit.php` with:
  ```php
  <?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;
  use Illuminate\Database\Eloquent\Relations\BelongsTo;

  class TransactionProfit extends Model
  {
      use HasFactory;

      protected $table = 'transaction_profits';

      protected $fillable = [
          'transaction_id',
          'total_revenue',
          'total_cost',
          'profit',
      ];

      public function transaction(): BelongsTo
      {
          return $this->belongsTo(Transaction::class);
      }
  }
  ```

- [ ] **Step 5: Modify existing Transaction model to add relationship**
  Modify `app/Models/Transaction.php` to add:
  ```php
      public function transactionProfit()
      {
          return $this->hasOne(TransactionProfit::class);
      }
  ```
  Add `use App\Models\TransactionProfit;` if necessary.

- [ ] **Step 6: Run tests and format PHP code**
  Run: `php artisan migrate:fresh --seed`
  Run: `php artisan test tests/Feature/Transaction/TransactionProfitModelTest.php --compact`
  Expected: PASS
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 7: Commit**
  ```bash
  git add database/migrations/2026_07_24_000000_create_transaction_profits_table.php app/Models/TransactionProfit.php app/Models/Transaction.php tests/Feature/Transaction/TransactionProfitModelTest.php
  git commit -m "feat: add transaction_profits database table and model relationship"
  ```

---

### Task 2: Integrasi Checkout di TransactionService

**Files:**
- Modify: `app/Services/TransactionService.php:127-200`
- Modify: `tests/Feature/Transaction/TransactionServiceTest.php`

**Interfaces:**
- Consumes: `App\Models\TransactionProfit`
- Produces: Saving `TransactionProfit` record on successful checkout inside DB transaction.

- [ ] **Step 1: Write test case inside TransactionServiceTest**
  Open `tests/Feature/Transaction/TransactionServiceTest.php` and append a test to ensure transaction checkout calculates cost and profit and saves to `transaction_profits` table:
  ```php
  test('checkout records profit data successfully', function () {
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

      $service = app(\App\Support\Interfaces\Services\TransactionServiceInterface::class);
      $transaction = $service->checkout($checkoutData);

      expect($transaction->transactionProfit)->not->toBeNull();
      // Revenue = (10000 * 1) - 1000 = 9000. Cost = 7000 * 1 = 7000. Profit = 9000 - 7000 = 2000.
      expect((float)$transaction->transactionProfit->total_revenue)->toEqual(9000.00);
      expect((float)$transaction->transactionProfit->total_cost)->toEqual(7000.00);
      expect((float)$transaction->transactionProfit->profit)->toEqual(2000.00);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `php artisan test tests/Feature/Transaction/TransactionServiceTest.php --compact`
  Expected: FAIL with transactionProfit is null.

- [ ] **Step 3: Modify checkout logic in TransactionService**
  Modify `app/Services/TransactionService.php` to calculate and save profit. Find line ~175 inside the DB transaction block:
  ```php
                  // Calculate total cost (HPP)
                  $totalCost = 0;
                  foreach ($validatedItems as $validated) {
                      $item = $validated['item'];
                      $totalCost += $item['cost_price'] * $item['quantity'];
                  }

                  // Create transaction_profits record
                  $transaction->transactionProfit()->create([
                      'total_revenue' => $totalAmount,
                      'total_cost' => $totalCost,
                      'profit' => $totalAmount - $totalCost,
                  ]);
  ```
  And update the return statement:
  ```php
                  return $transaction->fresh(['transactionDetails.product', 'paymentMethod', 'user', 'transactionProfit']);
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `php artisan test tests/Feature/Transaction/TransactionServiceTest.php --compact`
  Expected: PASS
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 5: Commit**
  ```bash
  git add app/Services/TransactionService.php tests/Feature/Transaction/TransactionServiceTest.php
  git commit -m "feat: integrate transaction profit recording in checkout process"
  ```

---

### Task 3: Backend API dan Web Routes untuk Profit Report

**Files:**
- Modify: `app/Support/Enums/TransactionPermissionEnums.php`
- Modify: `database/seeders/PermissionSeeder.php`
- Create: `app/Http/Controllers/Api/ApiProfitReportController.php`
- Create: `app/Http/Controllers/ProfitReportController.php`
- Modify: `routes/web.php`
- Create: `tests/Feature/Transaction/ApiProfitReportControllerTest.php`

**Interfaces:**
- Consumes: `App\Models\TransactionProfit`
- Produces: API response at `GET /api/profit-report` and Web page at `GET /profit-report`.

- [ ] **Step 1: Update Permission Enums and Seeder**
  Modify `app/Support/Enums/TransactionPermissionEnums.php`:
  ```php
  <?php

  namespace App\Support\Enums;

  enum TransactionPermissionEnums: string
  {
      case CREATE_TRANSACTION = 'create-transaction';
      case READ_TRANSACTION = 'read-transaction';
      case UPDATE_TRANSACTION = 'update-transaction';
      case DELETE_TRANSACTION = 'delete-transaction';
      case READ_TRANSACTION_PROFIT = 'read-transaction-profit';
  }
  ```
  Modify `database/seeders/PermissionSeeder.php` inside the cases loop:
  ```php
          foreach (TransactionPermissionEnums::cases() as $permission) {
              Permission::firstOrCreate([
                  'name' => $permission->value,
              ]);
          }
  ```
  And grant permission to `Admin`:
  ```php
          $admin->givePermissionTo([
              // ... existing
              TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value,
          ]);
  ```

- [ ] **Step 2: Create Controller ApiProfitReportController**
  Create `app/Http/Controllers/Api/ApiProfitReportController.php`:
  ```php
  <?php

  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\TransactionProfit;
  use App\Support\Utils\ResponseApi;
  use Illuminate\Http\Request;
  use Illuminate\Routing\Controllers\HasMiddleware;
  use Illuminate\Routing\Controllers\Middleware;
  use App\Support\Enums\TransactionPermissionEnums;

  class ApiProfitReportController extends Controller implements HasMiddleware
  {
      public static function middleware(): array
      {
          return [
              new Middleware(
                  'permission:'.TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value,
                  only: ['index']
              ),
          ];
      }

      public function index(Request $request)
      {
          try {
              $query = TransactionProfit::query()
                  ->with(['transaction.user', 'transaction.paymentMethod']);

              // Filter by Date Range
              if ($request->filled('start_date')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->whereDate('created_at', '>=', $request->start_date);
                  });
              }
              if ($request->filled('end_date')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->whereDate('created_at', '<=', $request->end_date);
                  });
              }

              // Filter by User/Cashier
              if ($request->filled('user_id')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->where('user_id', $request->user_id);
                  });
              }

              // Filter by Payment Method
              if ($request->filled('payment_method_id')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->where('payment_method_id', $request->payment_method_id);
                  });
              }

              // Search by Invoice Number
              if ($request->filled('keyword')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->where('invoice_number', 'ilike', "%{$request->keyword}%");
                  });
              }

              // Order by
              if ($request->filled('order_by') && $request->filled('order')) {
                  $orderBy = $request->order_by;
                  if (in_array($orderBy, ['total_revenue', 'total_cost', 'profit'])) {
                      $query->orderBy($orderBy, $request->order);
                  } else {
                      $query->orderBy('id', 'desc');
                  }
              } else {
                  $query->orderBy('id', 'desc');
              }

              // Calculate aggregated totals BEFORE pagination
              $summaryQuery = clone $query;
              $summary = [
                  'total_revenue' => (float) $summaryQuery->sum('total_revenue'),
                  'total_cost' => (float) $summaryQuery->sum('total_cost'),
                  'total_net_profit' => (float) $summaryQuery->sum('profit'),
                  'total_transactions' => $summaryQuery->count(),
              ];

              $limit = $request->input('limit', 10);
              $paginated = $query->paginate($limit);

              // Map to clean resource data
              $mappedData = collect($paginated->items())->map(function ($item) {
                  return [
                      'id' => $item->id,
                      'transaction_id' => $item->transaction_id,
                      'invoice_number' => $item->transaction->invoice_number,
                      'created_at' => $item->transaction->created_at->getTimestamp(),
                      'cashier_name' => $item->transaction->user->name ?? '-',
                      'payment_method_name' => $item->transaction->paymentMethod->name ?? '-',
                      'total_revenue' => (float) $item->total_revenue,
                      'total_cost' => (float) $item->total_cost,
                      'profit' => (float) $item->profit,
                  ];
              });

              return ResponseApi::make(true, trans('message.success.success'), [
                  'summary' => $summary,
                  'transactions' => [
                      'data' => $mappedData,
                      'meta' => [
                          'current_page' => $paginated->currentPage(),
                          'last_page' => $paginated->lastPage(),
                          'per_page' => $paginated->perPage(),
                          'total' => $paginated->total(),
                      ]
                  ]
              ]);
          } catch (\Throwable $th) {
              return ResponseApi::make(false, $th->getMessage(), null, 500);
          }
      }
  }
  ```

- [ ] **Step 3: Create Web Controller ProfitReportController**
  Create `app/Http/Controllers/ProfitReportController.php`:
  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Models\StoreSetting;
  use App\Support\Enums\TransactionPermissionEnums;
  use Illuminate\Routing\Controllers\HasMiddleware;
  use Illuminate\Routing\Controllers\Middleware;

  class ProfitReportController extends Controller implements HasMiddleware
  {
      public static function middleware(): array
      {
          return [
              new Middleware(
                  'permission:'.TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value,
                  only: ['index']
              ),
          ];
      }

      public function index()
      {
          $storeSetting = StoreSetting::first() ?? new StoreSetting([
              'name' => 'Toko Maju Jaya',
              'address' => 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
              'phone' => '081234567890',
              'email' => 'contact@majujaya.com',
          ]);

          return inertia('profit-report/index', [
              'storeSetting' => $storeSetting,
          ]);
      }
  }
  ```

- [ ] **Step 4: Register routes in web.php**
  Open `routes/web.php` and add under the authenticated group:
  ```php
      Route::resource('profit-report', ProfitReportController::class)->only('index');
  ```
  And inside the `api` group:
  ```php
          Route::get('/profit-report', [ApiProfitReportController::class, 'index'])->name('apiProfitReport.index');
  ```

- [ ] **Step 5: Write Pest Controller Test**
  Create `tests/Feature/Transaction/ApiProfitReportControllerTest.php`:
  ```php
  <?php

  use App\Models\User;
  use App\Models\PaymentMethod;
  use App\Models\Transaction;
  use App\Models\TransactionProfit;
  use App\Support\Enums\TransactionPermissionEnums;
  use Spatie\Permission\Models\Permission;

  uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

  test('admin with read-transaction-profit permission can access profit report API', function () {
      $user = User::factory()->create();
      $permission = Permission::firstOrCreate(['name' => TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value]);
      $user->givePermissionTo($permission);
      $this->actingAs($user);

      $paymentMethod = PaymentMethod::factory()->create();
      $transaction = Transaction::create([
          'user_id' => $user->id,
          'payment_method_id' => $paymentMethod->id,
          'invoice_number' => 'INV-PROFIT-001',
          'total_amount' => 150000.00,
          'payment_amount' => 200000.00,
          'change_amount' => 50000.00,
      ]);

      TransactionProfit::create([
          'transaction_id' => $transaction->id,
          'total_revenue' => 150000.00,
          'total_cost' => 100000.00,
          'profit' => 50000.00,
      ]);

      $response = $this->getJson(route('apiProfitReport.index'));

      $response->assertStatus(200)
          ->assertJsonPath('success', true)
          ->assertJsonPath('data.summary.total_revenue', 150000.00)
          ->assertJsonPath('data.summary.total_cost', 100000.00)
          ->assertJsonPath('data.summary.total_net_profit', 50000.00);
  });

  test('unauthorized user cannot access profit report API', function () {
      $user = User::factory()->create();
      $this->actingAs($user);

      $response = $this->getJson(route('apiProfitReport.index'));
      $response->assertStatus(403);
  });
  ```

- [ ] **Step 6: Run tests and format PHP code**
  Run: `php artisan db:seed --class=PermissionSeeder`
  Run: `php artisan test tests/Feature/Transaction/ApiProfitReportControllerTest.php --compact`
  Expected: PASS
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 7: Commit**
  ```bash
  git add app/Support/Enums/TransactionPermissionEnums.php database/seeders/PermissionSeeder.php app/Http/Controllers/Api/ApiProfitReportController.php app/Http/Controllers/ProfitReportController.php routes/web.php tests/Feature/Transaction/ApiProfitReportControllerTest.php
  git commit -m "feat: add profit report controllers, routes, and permissions"
  ```

---

### Task 4: Frontend Routing, Enums, dan Sidebar

**Files:**
- Modify: `resources/js/support/enums/PermissionEnums.ts`
- Modify: `resources/js/components/app-sidebar.tsx`

**Interfaces:**
- Consumes: Wayfinder routes
- Produces: Updated permission enums, sidebar navigation to `/profit-report` visible only to authorized users.

- [ ] **Step 1: Add profit permission in PermissionEnums.ts**
  Modify `resources/js/support/enums/PermissionEnums.ts` by adding to `TransactionPermissionEnums`:
  ```typescript
  enum TransactionPermissionEnums {
      CREATE = 'create-transaction',
      READ = 'read-transaction',
      UPDATE = 'update-transaction',
      DELETE = 'delete-transaction',
      READ_PROFIT = 'read-transaction-profit',
  }
  ```
  And inside `PERMISSIONLIST()`:
  ```typescript
                  {
                      LABEL: t(
                          'permission_label.transaction.read_profit',
                          'Baca Profit Transaksi',
                      ),
                      VALUE: TransactionPermissionEnums.READ_PROFIT,
                  },
  ```

- [ ] **Step 2: Add sidebar navigation link**
  Open `resources/js/components/app-sidebar.tsx`. Import the new route helper at the top:
  ```typescript
  import { index as profitReport } from '@/routes/profit-report';
  ```
  Add to `navGroups[1]` ("Penjualan & Transaksi") items:
  ```typescript
                  {
                      title: t(
                          'component.sidebar.profit_report_menu_label',
                          'Laporan Profit',
                      ),
                      href: profitReport(),
                      icon: Banknote,
                      permission: PERMISSIONENUMS.TRANSACTION.READ_PROFIT,
                      role: [],
                  },
  ```

- [ ] **Step 3: Run Wayfinder generator to generate TS routes**
  Run: `php artisan wayfinder:generate`
  Run: `npm run build` or `npm run dev` to compile
  Expected: Successful compilation without TS errors.

- [ ] **Step 4: Commit**
  ```bash
  git add resources/js/support/enums/PermissionEnums.ts resources/js/components/app-sidebar.tsx
  git commit -m "feat: add profit report sidebar link and update permissions enum"
  ```

---

### Task 5: Frontend Page Component for Laporan Profit

**Files:**
- Create: `resources/js/pages/profit-report/index.tsx`
- Create: `resources/js/pages/profit-report/columns.tsx`
- Create: `resources/js/pages/profit-report/data-table.tsx`

**Interfaces:**
- Consumes: `GET /api/profit-report` response, detailed dialog components.
- Produces: Responsive UI with summary cards, search keyword, date filters, cashier filter, payment method filter, and interactive profit list table.

- [ ] **Step 1: Create columns.tsx**
  Create `resources/js/pages/profit-report/columns.tsx` with:
  ```typescript
  import type { ColumnDef } from '@tanstack/react-table';
  import { FileText, MoreHorizontal } from 'lucide-react';
  import { useTranslation } from 'react-i18next';
  import { ServerSideDataTableHeader } from '@/components/server-side-data-table-header';
  import { Button } from '@/components/ui/button';
  import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import { formatRupiah } from '@/lib/format-money';
  import dayjs from 'dayjs';

  export interface ProfitRecord {
      id: number;
      transaction_id: number;
      invoice_number: string;
      created_at: number;
      cashier_name: string;
      payment_method_name: string;
      total_revenue: number;
      total_cost: number;
      profit: number;
  }

  interface ColumnsProps {
      onDetailClick: (id: number, invoice: string) => void;
      onSortChange: (orderBy: string | null, order: string | null) => void;
      orderBy: string | null;
      order: string | null;
  }

  export const columns = (props?: ColumnsProps): ColumnDef<ProfitRecord>[] => {
      const { t } = useTranslation();

      return [
          {
              id: t('page.profit.columns.invoice', 'No. Invoice'),
              accessorKey: 'invoice_number',
              header: ({ column }) => (
                  <ServerSideDataTableHeader
                      column={column}
                      title={t('page.profit.columns.invoice', 'No. Invoice')}
                      sortKey="invoice_number"
                      orderBy={props?.orderBy}
                      order={props?.order}
                      onSortChange={props?.onSortChange}
                  />
              ),
              cell: ({ row }) => (
                  <button
                      type="button"
                      onClick={() => props?.onDetailClick(row.original.transaction_id, row.original.invoice_number)}
                      className="cursor-pointer text-left font-mono text-sm font-semibold whitespace-nowrap text-primary transition-colors hover:text-primary/80 hover:underline focus:outline-none"
                  >
                      {row.original.invoice_number}
                  </button>
              ),
          },
          {
              id: t('page.profit.columns.date', 'Tanggal & Waktu'),
              accessorKey: 'created_at',
              cell: ({ row }) => dayjs.unix(row.original.created_at).format('DD/MM/YYYY HH:mm'),
          },
          {
              id: t('page.profit.columns.cashier', 'Kasir'),
              accessorKey: 'cashier_name',
              cell: ({ row }) => row.original.cashier_name,
          },
          {
              id: t('page.profit.columns.payment', 'Metode Bayar'),
              accessorKey: 'payment_method_name',
              cell: ({ row }) => row.original.payment_method_name,
          },
          {
              id: t('page.profit.columns.revenue', 'Total Penjualan'),
              accessorKey: 'total_revenue',
              header: ({ column }) => (
                  <ServerSideDataTableHeader
                      column={column}
                      title={t('page.profit.columns.revenue', 'Total Penjualan')}
                      sortKey="total_revenue"
                      orderBy={props?.orderBy}
                      order={props?.order}
                      onSortChange={props?.onSortChange}
                  />
              ),
              cell: ({ row }) => formatRupiah(row.original.total_revenue),
          },
          {
              id: t('page.profit.columns.cost', 'Total Modal (HPP)'),
              accessorKey: 'total_cost',
              header: ({ column }) => (
                  <ServerSideDataTableHeader
                      column={column}
                      title={t('page.profit.columns.cost', 'Total Modal (HPP)')}
                      sortKey="total_cost"
                      orderBy={props?.orderBy}
                      order={props?.order}
                      onSortChange={props?.onSortChange}
                  />
              ),
              cell: ({ row }) => formatRupiah(row.original.total_cost),
          },
          {
              id: t('page.profit.columns.profit', 'Laba Bersih'),
              accessorKey: 'profit',
              header: ({ column }) => (
                  <ServerSideDataTableHeader
                      column={column}
                      title={t('page.profit.columns.profit', 'Laba Bersih')}
                      sortKey="profit"
                      orderBy={props?.orderBy}
                      order={props?.order}
                      onSortChange={props?.onSortChange}
                  />
              ),
              cell: ({ row }) => {
                  const profit = row.original.profit;
                  const isPositive = profit >= 0;
                  return (
                      <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatRupiah(profit)}
                      </span>
                  );
              },
          },
          {
              id: t('page.profit.columns.actions', 'Aksi'),
              cell: ({ row }) => (
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('page.profit.actions.title', 'Aksi')}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => props?.onDetailClick(row.original.transaction_id, row.original.invoice_number)}>
                              <FileText className="mr-2 h-4 w-4 text-blue-500" />
                              Detail Transaksi
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              ),
          },
      ];
  };
  ```

- [ ] **Step 2: Create data-table.tsx**
  Create `resources/js/pages/profit-report/data-table.tsx` with:
  ```typescript
  import {
      flexRender,
      getCoreRowModel,
      useReactTable,
      type ColumnDef,
      type SortingState,
  } from '@tanstack/react-table';
  import { RefreshCw, Search } from 'lucide-react';
  import { useState } from 'react';
  import { useTranslation } from 'react-i18next';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
  } from '@/components/ui/select';
  import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
  } from '@/components/ui/table';
  import type { PaymentMethod } from '@/support/models/paymentMethod';
  import type { User } from '@/support/models/user';
  import { ServerSideDataTablePagination } from '@/components/server-side-data-table-pagination';

  interface DataTableProps<TData, TValue> {
      columns: ColumnDef<TData, TValue>[];
      data: TData[];
      users: User[];
      paymentMethods: PaymentMethod[];
      processing: boolean;
      queryParam: any;
      pagination: any;
      onQueryParamChange: (key: string, value: any) => void;
      onResetFilter: () => void;
      onRefresh: () => void;
  }

  export function DataTable<TData, TValue>({
      columns,
      data,
      users,
      paymentMethods,
      processing,
      queryParam,
      pagination,
      onQueryParamChange,
      onResetFilter,
      onRefresh,
  }: DataTableProps<TData, TValue>) {
      const { t } = useTranslation();
      const [sorting, setSorting] = useState<SortingState>([]);

      const table = useReactTable({
          data,
          columns,
          getCoreRowModel: getCoreRowModel(),
          state: {
              sorting,
          },
          onSortingChange: setSorting,
          manualSorting: true,
      });

      return (
          <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          placeholder={t('page.profit.filters.search_invoice', 'Cari Invoice...')}
                          value={queryParam.keyword || ''}
                          onChange={(e) => onQueryParamChange('keyword', e.target.value)}
                          className="pl-8"
                      />
                  </div>

                  <div className="w-[180px]">
                      <Select
                          value={queryParam.user_id ? String(queryParam.user_id) : 'all'}
                          onValueChange={(val) => onQueryParamChange('user_id', val === 'all' ? null : Number(val))}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder={t('page.profit.filters.all_cashiers', 'Semua Kasir')} />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">{t('page.profit.filters.all_cashiers', 'Semua Kasir')}</SelectItem>
                              {users.map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="w-[180px]">
                      <Select
                          value={queryParam.payment_method_id ? String(queryParam.payment_method_id) : 'all'}
                          onValueChange={(val) => onQueryParamChange('payment_method_id', val === 'all' ? null : Number(val))}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder={t('page.profit.filters.all_payments', 'Semua Metode')} />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">{t('page.profit.filters.all_payments', 'Semua Metode')}</SelectItem>
                              {paymentMethods.map((pm) => (
                                  <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="flex gap-2">
                      <Input
                          type="date"
                          value={queryParam.start_date || ''}
                          onChange={(e) => onQueryParamChange('start_date', e.target.value)}
                          className="w-[140px]"
                      />
                      <span className="self-center text-muted-foreground">-</span>
                      <Input
                          type="date"
                          value={queryParam.end_date || ''}
                          onChange={(e) => onQueryParamChange('end_date', e.target.value)}
                          className="w-[140px]"
                      />
                  </div>

                  <Button variant="outline" onClick={onResetFilter}>
                      {t('page.profit.filters.reset_btn', 'Reset')}
                  </Button>
                  <Button variant="outline" size="icon" onClick={onRefresh} disabled={processing}>
                      <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                  </Button>
              </div>

              {/* Table */}
              <div className="rounded-md border bg-card">
                  <Table>
                      <TableHeader>
                          {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                  {headerGroup.headers.map((header) => (
                                      <TableHead key={header.id}>
                                          {header.isPlaceholder
                                              ? null
                                              : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                      </TableHead>
                                  ))}
                              </TableRow>
                          ))}
                      </TableHeader>
                      <TableBody>
                          {processing ? (
                              <TableRow>
                                  <TableCell colSpan={columns.length} className="h-24 text-center">
                                      {t('component.data_table.loading', 'Memuat...')}
                                  </TableCell>
                              </TableRow>
                          ) : data.length > 0 ? (
                              table.getRowModel().rows.map((row) => (
                                  <TableRow key={row.id}>
                                      {row.getVisibleCells().map((cell) => (
                                          <TableCell key={cell.id}>
                                              {flexRender(
                                                  cell.column.columnDef.cell,
                                                  cell.getContext(),
                                              )}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                      {t('component.data_table.no_data', 'Tidak ada data.')}
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </div>

              {/* Pagination */}
              <ServerSideDataTablePagination
                  currentPage={pagination.current_page}
                  lastPage={pagination.last_page}
                  perPage={pagination.per_page}
                  total={pagination.total}
                  onChangePage={(page) => onQueryParamChange('page', page)}
                  onChangeLimit={(limit) => onQueryParamChange('limit', limit)}
                  limitOptions={[10, 25, 50, 100]}
              />
          </div>
      );
  }
  ```

- [ ] **Step 3: Create index.tsx**
  Create `resources/js/pages/profit-report/index.tsx` with:
  ```typescript
  import { Head } from '@inertiajs/react';
  import i18next from 'i18next';
  import { useState, useEffect, useCallback } from 'react';
  import { useTranslation } from 'react-i18next';
  import HeaderContent from '@/components/header-content';
  import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
  import { formatRupiah } from '@/lib/format-money';
  import axiosInstance from '@/lib/axios';
  import { handleApiError } from '@/lib/utils';
  import { DetailDialog } from '@/pages/transaction/dialog-modal/detail-dialog';
  import type { StoreSetting } from '@/components/receipt-modal';
  import type { PaymentMethod } from '@/support/models/paymentMethod';
  import type { User } from '@/support/models/user';
  import { index as apiGetPaymentMethods } from '@/routes/apiPaymentMethods';
  import { all as apiGetAllUsers } from '@/routes/apiUsers';
  import { index as profitReportRoute } from '@/routes/profit-report';
  import { columns, type ProfitRecord } from './columns';
  import { DataTable } from './data-table';

  const { url } = profitReportRoute();

  interface SummaryData {
      total_revenue: number;
      total_cost: number;
      total_net_profit: number;
      total_transactions: number;
  }

  export default function ProfitReportIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
      const { t } = useTranslation();

      const [profitData, setProfitData] = useState<ProfitRecord[]>([]);
      const [summary, setSummary] = useState<SummaryData>({
          total_revenue: 0,
          total_cost: 0,
          total_net_profit: 0,
          total_transactions: 0,
      });
      const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
      const [users, setUsers] = useState<User[]>([]);
      const [processing, setProcessing] = useState(false);
      const [detailOpen, setDetailOpen] = useState(false);
      const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

      const [queryParam, setQueryParam] = useState({
          page: 1,
          limit: 10,
          keyword: '',
          user_id: null as number | null,
          payment_method_id: null as number | null,
          start_date: '',
          end_date: '',
          order_by: 'id',
          order: 'desc',
      });

      const [pagination, setPagination] = useState({
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
      });

      const fetchPaymentMethods = async () => {
          try {
              const res = await axiosInstance.get(apiGetPaymentMethods().url, {
                  params: { order_by: 'name', order: 'asc' },
              });
              if (res.data.success) setPaymentMethods(res.data.data);
          } catch (error) {
              handleApiError(error);
          }
      };

      const fetchUsers = async () => {
          try {
              const res = await axiosInstance.get(apiGetAllUsers().url);
              if (res.data.success) {
                  setUsers(Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []);
              }
          } catch (error) {
              handleApiError(error);
          }
      };

      const fetchProfitReport = useCallback(async () => {
          try {
              setProcessing(true);
              const params: Record<string, any> = { ...queryParam };
              const res = await axiosInstance.get('/api/profit-report', { params });
              if (res.data.success) {
                  setProfitData(res.data.data.transactions.data);
                  setSummary(res.data.data.summary);
                  if (res.data.data.transactions.meta) {
                      setPagination(res.data.data.transactions.meta);
                  }
              }
          } catch (error) {
              handleApiError(error);
          } finally {
              setProcessing(false);
          }
      }, [queryParam]);

      useEffect(() => {
          void Promise.all([fetchPaymentMethods(), fetchUsers()]);
      }, []);

      useEffect(() => {
          const timeoutId = setTimeout(() => {
              void fetchProfitReport();
          }, 300);
          return () => clearTimeout(timeoutId);
      }, [fetchProfitReport]);

      const handleDetailClick = (transactionId: number, invoiceNumber: string) => {
          setSelectedTransaction({ id: transactionId, invoice_number: invoiceNumber });
          setDetailOpen(true);
      };

      const handleQueryParamChange = (key: string, value: any) => {
          setQueryParam((prev) => ({
              ...prev,
              [key]: value,
              ...(key !== 'page' ? { page: 1 } : {}),
          }));
      };

      const handleResetFilter = () => {
          setQueryParam({
              page: 1,
              limit: 10,
              keyword: '',
              user_id: null,
              payment_method_id: null,
              start_date: '',
              end_date: '',
              order_by: 'id',
              order: 'desc',
          });
      };

      const handleSortChange = (orderBy: string | null, order: string | null) => {
          setQueryParam((prev) => ({
              ...prev,
              order_by: orderBy || 'id',
              order: order || 'desc',
              page: 1,
          }));
      };

      return (
          <>
              <Head title={t('page.profit.page_name', 'Laporan Profit')} />
              <div className="mb-16 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                  <HeaderContent>{t('page.profit.page_name', 'Laporan Profit')}</HeaderContent>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-blue-500 shadow-sm">
                          <CardHeader className="py-4">
                              <CardDescription>{t('page.profit.cards.revenue', 'Total Pendapatan')}</CardDescription>
                              <CardTitle className="text-2xl font-bold text-foreground">
                                  {formatRupiah(summary.total_revenue)}
                              </CardTitle>
                          </CardHeader>
                      </Card>

                      <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-amber-500 shadow-sm">
                          <CardHeader className="py-4">
                              <CardDescription>{t('page.profit.cards.cost', 'Total Modal / HPP')}</CardDescription>
                              <CardTitle className="text-2xl font-bold text-foreground">
                                  {formatRupiah(summary.total_cost)}
                              </CardTitle>
                          </CardHeader>
                      </Card>

                      <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-emerald-500 shadow-sm">
                          <CardHeader className="py-4">
                              <CardDescription>{t('page.profit.cards.profit', 'Total Laba Bersih')}</CardDescription>
                              <CardTitle className={`text-2xl font-bold ${summary.total_net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {formatRupiah(summary.total_net_profit)}
                              </CardTitle>
                          </CardHeader>
                      </Card>
                  </div>

                  {/* Table Component */}
                  <DataTable
                      columns={columns({
                          onDetailClick: handleDetailClick,
                          onSortChange: handleSortChange,
                          orderBy: queryParam.order_by,
                          order: queryParam.order,
                      })}
                      data={profitData}
                      users={users}
                      paymentMethods={paymentMethods}
                      processing={processing}
                      queryParam={queryParam}
                      pagination={pagination}
                      onQueryParamChange={handleQueryParamChange}
                      onResetFilter={handleResetFilter}
                      onRefresh={fetchProfitReport}
                  />

                  {/* Struk / Detail Transaction Modal */}
                  {selectedTransaction && (
                      <DetailDialog
                          isOpen={detailOpen}
                          transaction={selectedTransaction}
                          onOpenChange={setDetailOpen}
                          storeSetting={storeSetting}
                      />
                  )}
              </div>
          </>
      );
  }

  ProfitReportIndex.layout = {
      breadcrumbs: [
          {
              title: i18next.t('page.profit.page_name', 'Laporan Profit'),
              href: url,
          },
      ],
  };
  ```

- [ ] **Step 4: Run dev build to compile JS code and format project**
  Run: `npm run build`
  Expected: Successful compilation without JS or TypeScript errors.
  Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 5: Commit**
  ```bash
  git add resources/js/pages/profit-report/index.tsx resources/js/pages/profit-report/columns.tsx resources/js/pages/profit-report/data-table.tsx
  git commit -m "feat: add frontend pages and columns for transaction profit report"
  ```
