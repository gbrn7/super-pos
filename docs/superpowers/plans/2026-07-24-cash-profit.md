# Kas Profit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the transaction profit module into "Kas Profit", storing only the net profit from transactions (without revenue and cost) and displaying it with a single summary card on a custom dashboard for store owners.

**Architecture:** Use a new database table `cash_profits` connected to the `Transaction` model via a `hasOne` relationship. The checkout process saves the computed net profit, and endpoints serve this data to a React Inertia frontend with full permission checks.

**Tech Stack:** PHP 8.4, Laravel 13, Inertia React, TailwindCSS v4, Pest PHP.

## Global Constraints
- Target database table name: `cash_profits`.
- Primary fields: `transaction_id`, `profit` (decimal 15,2, signed).
- Permission key: `read-cash-profit`.
- Frontend view directory: `resources/js/pages/cash-profit/`.
- No revenue or cost columns/cards in the frontend.

---

### Task 1: Rollback and Database Migration Setup

**Files:**
- Modify: `database/migrations/2026_07_24_000000_create_transaction_profits_table.php` (Delete)
- Create: `database/migrations/2026_07_24_100000_create_cash_profits_table.php`

**Interfaces:**
- Consumes: Existing transactions and transaction details.
- Produces: `cash_profits` table in PostgreSQL database.

- [ ] **Step 1: Rollback the old transaction profits migration**
  Run command to rollback the last migration step:
  ```bash
  php artisan migrate:rollback --step=1
  ```

- [ ] **Step 2: Delete old migration file**
  Delete the file `database/migrations/2026_07_24_000000_create_transaction_profits_table.php`.

- [ ] **Step 3: Create the new migration file for cash_profits**
  Run the command to generate a new migration file:
  ```bash
  php artisan make:migration create_cash_profits_table --no-interaction
  ```

- [ ] **Step 4: Implement migration table definition and historical calculations**
  Write migration code in the newly created migration file under `database/migrations/` (exact name varies by timestamp, e.g., `2026_07_24_100000_create_cash_profits_table.php`):
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
          Schema::create('cash_profits', function (Blueprint $table) {
              $table->id();
              $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
              $table->decimal('profit', 15, 2);
              $table->timestamps();
          });

          // Calculate and migrate historical transaction profits
          $transactions = DB::table('transactions')->get();
          foreach ($transactions as $tx) {
              $details = DB::table('transaction_details')
                  ->where('transaction_id', $tx->id)
                  ->get();

              $totalCost = 0;
              $totalRevenue = $tx->total_amount;

              foreach ($details as $detail) {
                  $totalCost += $detail->cost_price * $detail->quantity;
              }

              $profit = $totalRevenue - $totalCost;

              DB::table('cash_profits')->insert([
                  'transaction_id' => $tx->id,
                  'profit' => $profit,
                  'created_at' => $tx->created_at,
                  'updated_at' => $tx->updated_at,
              ]);
          }
      }

      public function down(): void
      {
          Schema::dropIfExists('cash_profits');
      }
  };
  ```

- [ ] **Step 5: Run migration**
  Run:
  ```bash
  php artisan migrate
  ```
  Expected: Migration output displays success message for `create_cash_profits_table`.

- [ ] **Step 6: Commit**
  ```bash
  git add database/migrations/
  git commit -m "migration: create cash_profits table and migrate historical profits"
  ```

---

### Task 2: Model and Service Refactoring

**Files:**
- Create: `app/Models/CashProfit.php`
- Modify: `app/Models/Transaction.php`
- Modify: `app/Services/TransactionService.php`
- Create: `tests/Feature/Transaction/CashProfitModelTest.php`
- Modify: `tests/Feature/Transaction/TransactionServiceTest.php`
- Delete: `app/Models/TransactionProfit.php`
- Delete: `tests/Feature/Transaction/TransactionProfitModelTest.php`

**Interfaces:**
- Consumes: `cash_profits` table structure.
- Produces: `App\Models\CashProfit` model and updated `TransactionService` checkout logic.

- [ ] **Step 1: Delete old TransactionProfit model and test files**
  Delete:
  - `app/Models/TransactionProfit.php`
  - `tests/Feature/Transaction/TransactionProfitModelTest.php`

- [ ] **Step 2: Create CashProfit model**
  Run:
  ```bash
  php artisan make:model CashProfit --no-interaction
  ```

- [ ] **Step 3: Implement CashProfit model class**
  Write to `app/Models/CashProfit.php`:
  ```php
  <?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Model;
  use Illuminate\Database\Eloquent\Relations\BelongsTo;
  use Illuminate\Database\Eloquent\Factories\HasFactory;

  class CashProfit extends Model
  {
      use HasFactory;

      protected $fillable = [
          'transaction_id',
          'profit',
      ];

      public function transaction(): BelongsTo
      {
          return $this->belongsTo(Transaction::class);
      }
  }
  ```

- [ ] **Step 4: Update Transaction model relation**
  Modify `app/Models/Transaction.php` to change `transactionProfit()` to `cashProfit()`:
  ```php
      public function cashProfit(): \Illuminate\Database\Eloquent\Relations\HasOne
      {
          return $this->hasOne(CashProfit::class);
      }
  ```

- [ ] **Step 5: Write CashProfit model test**
  Write to `tests/Feature/Transaction/CashProfitModelTest.php`:
  ```php
  <?php

  use App\Models\User;
  use App\Models\PaymentMethod;
  use App\Models\Transaction;
  use App\Models\CashProfit;

  uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

  test('transaction has a cash profit relationship and correctly records profit data', function () {
      $user = User::factory()->create();
      $paymentMethod = PaymentMethod::factory()->create();

      $transaction = Transaction::create([
          'user_id' => $user->id,
          'payment_method_id' => $paymentMethod->id,
          'invoice_number' => 'INV-TEST-001',
          'total_amount' => 150000.00,
          'payment_amount' => 200000.00,
          'change_amount' => 50000.00,
      ]);

      $cashProfit = CashProfit::create([
          'transaction_id' => $transaction->id,
          'profit' => 50000.00,
      ]);

      expect($transaction->cashProfit)->not->toBeNull()
          ->and($transaction->cashProfit->profit)->toEqual('50000.00')
          ->and($cashProfit->transaction->id)->toEqual($transaction->id);
  });
  ```

- [ ] **Step 6: Run model test**
  Run:
  ```bash
  php artisan test tests/Feature/Transaction/CashProfitModelTest.php
  ```
  Expected: PASS

- [ ] **Step 7: Refactor TransactionService checkout logic**
  Open `app/Services/TransactionService.php` and replace `transactionProfit` record creation with `cashProfit`:
  ```php
              // Save net profit to cash_profits table
              $transaction->cashProfit()->create([
                  'profit' => $transaction->total_amount - $totalCost,
              ]);
  ```

- [ ] **Step 8: Update TransactionServiceTest.php**
  Open `tests/Feature/Transaction/TransactionServiceTest.php` and replace assertions targeting `transactionProfit` with `cashProfit`.
  ```php
      $this->assertDatabaseHas('cash_profits', [
          'transaction_id' => $transaction->id,
          'profit' => 5000.00,
      ]);
  ```

- [ ] **Step 9: Run TransactionService test**
  Run:
  ```bash
  php artisan test tests/Feature/Transaction/TransactionServiceTest.php --compact
  ```
  Expected: PASS

- [ ] **Step 10: Commit**
  ```bash
  git add app/Models/ app/Services/ tests/ && git commit -m "feat: refactor CashProfit model and integrate with TransactionService checkout"
  ```

---

### Task 3: Backend Routes, Permissions, and Controllers Refactoring

**Files:**
- Create: `app/Http/Controllers/Api/ApiCashProfitController.php`
- Create: `app/Http/Controllers/CashProfitController.php`
- Create: `tests/Feature/Transaction/ApiCashProfitControllerTest.php`
- Modify: `app/Support/Enums/TransactionPermissionEnums.php`
- Modify: `database/seeders/PermissionSeeder.php`
- Modify: `routes/web.php`
- Delete: `app/Http/Controllers/Api/ApiProfitReportController.php`
- Delete: `app/Http/Controllers/ProfitReportController.php`
- Delete: `tests/Feature/Transaction/ApiProfitReportControllerTest.php`

**Interfaces:**
- Consumes: `CashProfit` model.
- Produces: API `/api/cash-profit` endpoint and Web `/cash-profit` route.

- [ ] **Step 1: Delete old controllers and tests**
  Delete:
  - `app/Http/Controllers/Api/ApiProfitReportController.php`
  - `app/Http/Controllers/ProfitReportController.php`
  - `tests/Feature/Transaction/ApiProfitReportControllerTest.php`

- [ ] **Step 2: Rename permissions to read-cash-profit**
  In `app/Support/Enums/TransactionPermissionEnums.php`, modify permission from `READ_TRANSACTION_PROFIT` to:
  ```php
      case READ_CASH_PROFIT = 'read-cash-profit';
  ```

- [ ] **Step 3: Update PermissionSeeder**
  In `database/seeders/PermissionSeeder.php`, replace `TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value` with `TransactionPermissionEnums::READ_CASH_PROFIT->value`.

- [ ] **Step 4: Run database seeder**
  Run:
  ```bash
  php artisan db:seed --class=PermissionSeeder
  ```
  Expected: Seeding completed successfully.

- [ ] **Step 5: Create ApiCashProfitController**
  Write to `app/Http/Controllers/Api/ApiCashProfitController.php`:
  ```php
  <?php

  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\CashProfit;
  use App\Support\Utils\ResponseApi;
  use Illuminate\Http\Request;
  use Illuminate\Routing\Controllers\HasMiddleware;
  use Illuminate\Routing\Controllers\Middleware;
  use App\Support\Enums\TransactionPermissionEnums;

  class ApiCashProfitController extends Controller implements HasMiddleware
  {
      public static function middleware(): array
      {
          return [
              new Middleware(
                  'permission:'.TransactionPermissionEnums::READ_CASH_PROFIT->value,
                  only: ['index']
              ),
          ];
      }

      public function index(Request $request)
      {
          try {
              $query = CashProfit::query()
                  ->with(['transaction.user', 'transaction.paymentMethod']);

              // Filters
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
              if ($request->filled('user_id')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->where('user_id', $request->user_id);
                  });
              }
              if ($request->filled('payment_method_id')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->where('payment_method_id', $request->payment_method_id);
                  });
              }
              if ($request->filled('keyword')) {
                  $query->whereHas('transaction', function ($q) use ($request) {
                      $q->where('invoice_number', 'ilike', "%{$request->keyword}%");
                  });
              }

              // Sorting
              if ($request->filled('order_by') && $request->filled('order')) {
                  $orderBy = $request->order_by;
                  if ($orderBy === 'profit') {
                      $query->orderBy('profit', $request->order);
                  } else {
                      $query->orderBy('id', 'desc');
                  }
              } else {
                  $query->orderBy('id', 'desc');
              }

              // Aggregate summary before paging
              $summaryQuery = clone $query;
              $summary = [
                  'total_net_profit' => (float) $summaryQuery->sum('profit'),
                  'total_transactions' => $summaryQuery->count(),
              ];

              $limit = $request->input('limit', 10);
              $paginated = $query->paginate($limit);

              $mappedData = collect($paginated->items())->map(function ($item) {
                  return [
                      'id' => $item->id,
                      'transaction_id' => $item->transaction_id,
                      'invoice_number' => $item->transaction->invoice_number,
                      'created_at' => $item->transaction->created_at->getTimestamp(),
                      'cashier_name' => $item->transaction->user->name ?? '-',
                      'payment_method_name' => $item->transaction->paymentMethod->name ?? '-',
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

- [ ] **Step 6: Create CashProfitController**
  Write to `app/Http/Controllers/CashProfitController.php`:
  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Models\StoreSetting;
  use App\Support\Enums\TransactionPermissionEnums;
  use Illuminate\Routing\Controllers\HasMiddleware;
  use Illuminate\Routing\Controllers\Middleware;

  class CashProfitController extends Controller implements HasMiddleware
  {
      public static function middleware(): array
      {
          return [
              new Middleware(
                  'permission:'.TransactionPermissionEnums::READ_CASH_PROFIT->value,
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

          return inertia('cash-profit/index', [
              'storeSetting' => $storeSetting,
          ]);
      }
  }
  ```

- [ ] **Step 7: Update routes/web.php**
  Replace old profit-report web and api routes with `cash-profit`:
  ```php
  // Web route:
  Route::resource('cash-profit', CashProfitController::class)->only('index');

  // API route:
  Route::get('/cash-profit', [ApiCashProfitController::class, 'index'])->name('apiCashProfit.index');
  ```
  Ensure correct imports for `CashProfitController` and `ApiCashProfitController` at the top of the file, removing old profit report imports.

- [ ] **Step 8: Write API tests**
  Write to `tests/Feature/Transaction/ApiCashProfitControllerTest.php`:
  ```php
  <?php

  use App\Models\User;
  use App\Models\PaymentMethod;
  use App\Models\Transaction;
  use App\Models\CashProfit;
  use App\Support\Enums\TransactionPermissionEnums;
  use App\Models\Permission;

  uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

  test('admin with read-cash-profit permission can access cash profit API', function () {
      $user = User::factory()->create();
      $permission = Permission::firstOrCreate(['name' => TransactionPermissionEnums::READ_CASH_PROFIT->value]);
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

      CashProfit::create([
          'transaction_id' => $transaction->id,
          'profit' => 50000.00,
      ]);

      $response = $this->getJson(route('apiCashProfit.index'));

      $response->assertStatus(200)
          ->assertJsonPath('success', true)
          ->assertJsonPath('data.summary.total_net_profit', 50000)
          ->assertJsonPath('data.summary.total_transactions', 1);
  });

  test('unauthorized user cannot access cash profit API', function () {
      $user = User::factory()->create();
      $this->actingAs($user);

      $response = $this->getJson(route('apiCashProfit.index'));
      $response->assertStatus(403);
  });
  ```

- [ ] **Step 9: Run API tests**
  Run:
  ```bash
  php artisan test tests/Feature/Transaction/ApiCashProfitControllerTest.php --compact
  ```
  Expected: PASS

- [ ] **Step 10: Run Pint formatter**
  Run:
  ```bash
  vendor/bin/pint --dirty --format agent
  ```

- [ ] **Step 11: Commit**
  ```bash
  git add app/ routes/ database/ tests/ && git commit -m "feat: implement cash profit API and web routes with Pest tests"
  ```

---

### Task 4: Frontend Routing, Enums, Sidebar, and Page Refactoring

**Files:**
- Create: `resources/js/pages/cash-profit/columns.tsx`
- Create: `resources/js/pages/cash-profit/data-table.tsx`
- Create: `resources/js/pages/cash-profit/index.tsx`
- Modify: `resources/js/support/enums/PermissionEnums.ts`
- Modify: `resources/js/components/app-sidebar.tsx`
- Modify: `resources/js/routes/` (Wayfinder auto-generated)
- Delete: `resources/js/pages/profit-report/` (Delete folder)

**Interfaces:**
- Consumes: `/api/cash-profit` API endpoints and `cash-profit.index` web route.
- Produces: UI component for owner cash profit reports.

- [ ] **Step 1: Delete old profit-report pages directory**
  Delete folder `resources/js/pages/profit-report/`.

- [ ] **Step 2: Generate Wayfinder routes**
  Run:
  ```bash
  php artisan wayfinder:generate
  ```

- [ ] **Step 3: Update PermissionEnums.ts**
  Open `resources/js/support/enums/PermissionEnums.ts`.
  Replace `READ_PROFIT = 'read-transaction-profit'` with:
  ```typescript
  READ_CASH_PROFIT = 'read-cash-profit',
  ```
  Also update `PERMISSIONLIST()` to rename label to "Baca Kas Profit" and value to `TransactionPermissionEnums.READ_CASH_PROFIT`.

- [ ] **Step 4: Update app-sidebar.tsx**
  Open `resources/js/components/app-sidebar.tsx`.
  Remove `import { index as profitReport } from '@/routes/profit-report';` and replace with:
  ```typescript
  import { index as cashProfit } from '@/routes/cash-profit';
  ```
  Update the menu item inside `Penjualan & Transaksi` to point to `cashProfit()`, with title "Kas Profit" and permission `PERMISSIONENUMS.TRANSACTION.READ_CASH_PROFIT`.

- [ ] **Step 5: Create columns.tsx for cash-profit**
  Write to `resources/js/pages/cash-profit/columns.tsx`:
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

  export interface CashProfitRecord {
      id: number;
      transaction_id: number;
      invoice_number: string;
      created_at: number;
      cashier_name: string;
      payment_method_name: string;
      profit: number;
  }

  interface ColumnsProps {
      onDetailClick: (id: number, invoice: string) => void;
      onSortChange: (orderBy: string | null, order: string | null) => void;
      orderBy: string | null;
      order: string | null;
  }

  export const columns = (props?: ColumnsProps): ColumnDef<CashProfitRecord>[] => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
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
              id: t('page.profit.columns.profit', 'Keuntungan'),
              accessorKey: 'profit',
              header: ({ column }) => (
                  <ServerSideDataTableHeader
                      column={column}
                      title={t('page.profit.columns.profit', 'Keuntungan')}
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

- [ ] **Step 6: Create data-table.tsx for cash-profit**
  Write to `resources/js/pages/cash-profit/data-table.tsx`:
  ```typescript
  import {
      IconChevronLeft,
      IconChevronRight,
      IconChevronsLeft,
      IconChevronsRight,
  } from '@tabler/icons-react';
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
      SelectGroup,
      SelectItem,
      SelectLabel,
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
      onChangePaginationPage: (page: number) => void;
      onChangePaginationLimit: (limit: number) => void;
      limitOptions: number[];
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
      onChangePaginationPage,
      onChangePaginationLimit,
      limitOptions,
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

              {/* Pagination Footer */}
              <div className="flex flex-col items-center justify-between gap-4 border-t px-2 py-4 lg:flex-row">
                  <div className="text-sm text-muted-foreground">
                      {table.getFilteredSelectedRowModel().rows.length} dari {pagination.total} baris terpilih
                  </div>
                  <div className="flex w-full items-center gap-8 lg:w-fit">
                      <Select
                          value={queryParam.limit.toString()}
                          onValueChange={(value) => onChangePaginationLimit(Number(value))}
                      >
                          <SelectTrigger className="w-20">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectGroup>
                                  <SelectLabel>
                                      {t('component.data_table.row_per_page', 'Baris per halaman')}
                                  </SelectLabel>
                                  {limitOptions.map((option) => (
                                      <SelectItem key={option} value={option.toString()}>
                                          {option}
                                      </SelectItem>
                                  ))}
                              </SelectGroup>
                          </SelectContent>
                      </Select>
                      <div className="text-sm text-muted-foreground">
                          Halaman {pagination.current_page} dari {pagination.last_page}
                      </div>
                      <div className="ml-auto flex items-center gap-2 lg:ml-0">
                          <Button
                              variant="outline"
                              className="hidden h-8 w-8 p-0 lg:flex"
                              onClick={() => onChangePaginationPage(1)}
                              disabled={pagination.current_page == 1 || processing}
                          >
                              <span className="sr-only">Go to first page</span>
                              <IconChevronsLeft />
                          </Button>
                          <Button
                              variant="outline"
                              className="size-8"
                              size="icon"
                              onClick={() => {
                                  if (pagination.current_page - 1 > 0) {
                                      onChangePaginationPage(pagination.current_page - 1);
                                  }
                              }}
                              disabled={pagination.current_page == 1 || processing}
                          >
                              <span className="sr-only">Go to previous page</span>
                              <IconChevronLeft />
                          </Button>
                          <Button
                              variant="outline"
                              className="size-8"
                              size="icon"
                              onClick={() => {
                                  if (pagination.current_page != pagination.last_page) {
                                      onChangePaginationPage(pagination.current_page + 1);
                                  }
                              }}
                              disabled={pagination.current_page == pagination.last_page || processing}
                          >
                              <span className="sr-only">Go to next page</span>
                              <IconChevronRight />
                          </Button>
                          <Button
                              variant="outline"
                              className="hidden size-8 lg:flex"
                              size="icon"
                              onClick={() => onChangePaginationPage(pagination.last_page)}
                              disabled={pagination.current_page == pagination.last_page || processing}
                          >
                              <span className="sr-only">Go to last page</span>
                              <IconChevronsRight />
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }
  ```

- [ ] **Step 7: Create index.tsx for cash-profit**
  Write to `resources/js/pages/cash-profit/index.tsx`:
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
  import { index as cashProfitRoute } from '@/routes/cash-profit';
  import { columns, type CashProfitRecord } from './columns';
  import { DataTable } from './data-table';

  const { url } = cashProfitRoute();

  interface SummaryData {
      total_net_profit: number;
      total_transactions: number;
  }

  export default function CashProfitIndex({ storeSetting }: { storeSetting?: StoreSetting | null }) {
      const { t } = useTranslation();

      const [profitData, setProfitData] = useState<CashProfitRecord[]>([]);
      const [summary, setSummary] = useState<SummaryData>({
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

      const fetchCashProfit = useCallback(async () => {
          try {
              setProcessing(true);
              const params: Record<string, any> = { ...queryParam };
              const res = await axiosInstance.get('/api/cash-profit', { params });
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
              void fetchCashProfit();
          }, 300);
          return () => clearTimeout(timeoutId);
      }, [fetchCashProfit]);

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
              <Head title={t('page.profit.page_name', 'Kas Profit')} />
              <div className="mb-16 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                  <HeaderContent>{t('page.profit.page_name', 'Kas Profit')}</HeaderContent>

                  {/* Summary Card */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Card className="bg-gradient-to-tr from-primary/5 to-card border-l-4 border-l-emerald-500 shadow-xs">
                          <CardHeader className="py-4">
                              <CardDescription>{t('page.profit.cards.profit', 'Total Kas Profit')}</CardDescription>
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
                      onRefresh={fetchCashProfit}
                      onChangePaginationPage={(val) => handleQueryParamChange('page', val)}
                      onChangePaginationLimit={(val) => handleQueryParamChange('limit', val)}
                      limitOptions={[10, 25, 50, 100]}
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

  CashProfitIndex.layout = {
      breadcrumbs: [
          {
              title: i18next.t('page.profit.page_name', 'Kas Profit'),
              href: url,
          },
      ],
  };
  ```

- [ ] **Step 8: Run Vite compile check**
  Run:
  ```bash
  npm run build
  ```
  Expected: Success without TS compilation errors.

- [ ] **Step 9: Commit**
  ```bash
  git add resources/js/ && git commit -m "feat: implement frontend components and app sidebar navigation for cash profit"
  ```
