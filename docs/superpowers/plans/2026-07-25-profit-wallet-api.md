# Profit Wallet Datatable & Action API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement clean Datatable listing, summary calculations, and action endpoints (disburse and withdraw capital) for the Profit Wallet module using the Service-Repository pattern with typed Request Models.

**Architecture:** We will define Spatie permissions, register API routes in `routes/web.php`, encapsulate requests into Form Requests and Request Models, implement repository queries for listing & summary, and expose them via the service layer to the new API controller.

**Tech Stack:** PHP 8.4, Laravel 13, Pest PHP 4 (Testing).

## Global Constraints

*   Permissions must use Spatie enum cases and be assigned to the Admin role in `PermissionSeeder`.
*   Routes must be placed inside the `'api'` prefix route group in `routes/web.php`.
*   Date filters in the repository must convert `YYYY-MM-DD` query inputs into beginning/end of day Unix timestamps (`unsignedBigInteger`) using Carbon.
*   Pest PHP must be used for testing, extending `RefreshDatabase`.

---

## Tasks

### Task 1: Permissions Enum and Database Seeding

**Files:**
*   Create: `app/Support/Enums/ProfitWalletPermissionEnums.php`
*   Modify: `database/seeders/PermissionSeeder.php:12-88`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletPermissionTest.php`

**Interfaces:**
*   Produces: `ProfitWalletPermissionEnums` enum and database permission records.

- [ ] **Step 1: Write the Permission Enum and update Seeder**

`app/Support/Enums/ProfitWalletPermissionEnums.php`:
```php
<?php

namespace App\Support\Enums;

enum ProfitWalletPermissionEnums: string
{
    case READ_PROFIT_WALLET = 'read-profit-wallet';
    case DISBURSE_PROFIT_WALLET = 'disburse-profit-wallet';
    case WITHDRAW_CAPITAL_PROFIT_WALLET = 'withdraw-capital-profit-wallet';
}
```

Modify `database/seeders/PermissionSeeder.php`:
Add import:
```php
use App\Support\Enums\ProfitWalletPermissionEnums;
```
Inside `run()` method, loop and register profit wallet permissions:
```php
        foreach (ProfitWalletPermissionEnums::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
            ]);
        }
```
Inside `$admin->givePermissionTo([...])`:
```php
            ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value,
            ProfitWalletPermissionEnums::DISBURSE_PROFIT_WALLET->value,
            ProfitWalletPermissionEnums::WITHDRAW_CAPITAL_PROFIT_WALLET->value,
```

- [ ] **Step 2: Write permission feature test**

`tests/Feature/ProfitWallet/ProfitWalletPermissionTest.php`:
```php
<?php

use App\Models\Permission;
use App\Models\Role;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\ProfitWalletPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RoleSeeder;
use Database\Seeders\PermissionSeeder;

uses(RefreshDatabase::class);

test('permissions are seeded and assigned to admin role correctly', function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);

    foreach (ProfitWalletPermissionEnums::cases() as $perm) {
        expect(Permission::where('name', $perm->value)->exists())->toBeTrue();
    }

    $adminRole = Role::findByName(RoleEnums::ADMIN->value);
    expect($adminRole->hasPermissionTo(ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(ProfitWalletPermissionEnums::DISBURSE_PROFIT_WALLET->value))->toBeTrue()
        ->and($adminRole->hasPermissionTo(ProfitWalletPermissionEnums::WITHDRAW_CAPITAL_PROFIT_WALLET->value))->toBeTrue();
});
```

- [ ] **Step 3: Run the test**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletPermissionTest.php --compact`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/Support/Enums/ProfitWalletPermissionEnums.php database/seeders/PermissionSeeder.php tests/Feature/ProfitWallet/ProfitWalletPermissionTest.php
git commit -m "feat: add permissions for profit wallet and seed them"
```

---

### Task 2: Request Models & Form Requests Setup

**Files:**
*   Create: `app/Support/Models/ProfitWallet/GetProfitWalletTransactionReqModel.php`
*   Create: `app/Support/Models/ProfitWallet/DisburseProfitWalletReqModel.php`
*   Create: `app/Support/Models/ProfitWallet/WithdrawCapitalProfitWalletReqModel.php`
*   Create: `app/Http/Requests/ProfitWallet/IndexProfitWalletRequest.php`
*   Create: `app/Http/Requests/ProfitWallet/DisburseProfitWalletRequest.php`
*   Create: `app/Http/Requests/ProfitWallet/WithdrawCapitalProfitWalletRequest.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletRequestValidationTest.php`

**Interfaces:**
*   Produces: Request Model classes and Form Request classes.

- [ ] **Step 1: Write Request Models**

`app/Support/Models/ProfitWallet/GetProfitWalletTransactionReqModel.php`:
```php
<?php

namespace App\Support\Models\ProfitWallet;

use Illuminate\Http\Request;

class GetProfitWalletTransactionReqModel
{
    public ?string $start_date;
    public ?string $end_date;
    public ?string $type;
    public ?string $transaction_type;
    public ?string $keyword;
    public ?int $page;
    public ?int $limit;

    public function __construct(Request $request)
    {
        $this->start_date = $request->query('start_date');
        $this->end_date = $request->query('end_date');
        $this->type = $request->query('type');
        $this->transaction_type = $request->query('transaction_type');
        $this->keyword = $request->query('keyword');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
    }
}
```

`app/Support/Models/ProfitWallet/DisburseProfitWalletReqModel.php`:
```php
<?php

namespace App\Support\Models\ProfitWallet;

use Illuminate\Http\Request;

class DisburseProfitWalletReqModel
{
    public float $amount;
    public ?string $notes;

    public function __construct(Request $request)
    {
        $this->amount = (float) $request->input('amount');
        $this->notes = $request->input('notes');
    }
}
```

`app/Support/Models/ProfitWallet/WithdrawCapitalProfitWalletReqModel.php`:
```php
<?php

namespace App\Support\Models\ProfitWallet;

use Illuminate\Http\Request;

class WithdrawCapitalProfitWalletReqModel
{
    public float $amount;
    public ?string $notes;

    public function __construct(Request $request)
    {
        $this->amount = (float) $request->input('amount');
        $this->notes = $request->input('notes');
    }
}
```

- [ ] **Step 2: Write Form Requests**

`app/Http/Requests/ProfitWallet/IndexProfitWalletRequest.php`:
```php
<?php

namespace App\Http\Requests\ProfitWallet;

use Illuminate\Foundation\Http\FormRequest;

class IndexProfitWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'type' => ['nullable', 'in:in,out'],
            'transaction_type' => ['nullable', 'in:sales_profit,disbursement,capital_withdrawal'],
            'keyword' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
```

`app/Http/Requests/ProfitWallet/DisburseProfitWalletRequest.php`:
```php
<?php

namespace App\Http\Requests\ProfitWallet;

use Illuminate\Foundation\Http\FormRequest;

class DisburseProfitWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

`app/Http/Requests/ProfitWallet/WithdrawCapitalProfitWalletRequest.php`:
```php
<?php

namespace App\Http\Requests\ProfitWallet;

use Illuminate\Foundation\Http\FormRequest;

class WithdrawCapitalProfitWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

- [ ] **Step 3: Write tests for Form Request validations**

`tests/Feature/ProfitWallet/ProfitWalletRequestValidationTest.php`:
```php
<?php

use App\Http\Requests\ProfitWallet\IndexProfitWalletRequest;
use App\Http\Requests\ProfitWallet\DisburseProfitWalletRequest;
use Illuminate\Support\Facades\Validator;

test('index profit wallet request validates filters correctly', function () {
    $rules = (new IndexProfitWalletRequest())->rules();

    $validator = Validator::make([
        'start_date' => 'not-a-date',
        'type' => 'invalid-type',
        'limit' => 200,
    ], $rules);

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('start_date'))->toBeTrue()
        ->and($validator->errors()->has('type'))->toBeTrue()
        ->and($validator->errors()->has('limit'))->toBeTrue();
});

test('disburse request validates amount requirements', function () {
    $rules = (new DisburseProfitWalletRequest())->rules();

    $validator1 = Validator::make(['amount' => 0.00], $rules);
    $validator2 = Validator::make(['amount' => -100.00], $rules);
    $validator3 = Validator::make(['amount' => 500.50], $rules);

    expect($validator1->fails())->toBeTrue()
        ->and($validator2->fails())->toBeTrue()
        ->and($validator3->fails())->toBeFalse();
});
```

- [ ] **Step 4: Run the test**

Run: `php artisan test tests/Feature/ProfitWallet/ProfitWalletRequestValidationTest.php --compact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Support/Models/ProfitWallet/GetProfitWalletTransactionReqModel.php app/Support/Models/ProfitWallet/DisburseProfitWalletReqModel.php app/Support/Models/ProfitWallet/WithdrawCapitalProfitWalletReqModel.php app/Http/Requests/ProfitWallet/IndexProfitWalletRequest.php app/Http/Requests/ProfitWallet/DisburseProfitWalletRequest.php app/Http/Requests/ProfitWallet/WithdrawCapitalProfitWalletRequest.php tests/Feature/ProfitWallet/ProfitWalletRequestValidationTest.php
git commit -m "feat: add form requests and request models for profit wallet"
```

---

### Task 3: Repository & Service Enhancements

**Files:**
*   Modify: `app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php`
*   Modify: `app/Repositories/ProfitWalletRepository.php`
*   Modify: `app/Support/Interfaces/Services/ProfitWalletServiceInterface.php`
*   Modify: `app/Services/ProfitWalletService.php`
*   Create: `tests/Feature/ProfitWallet/ProfitWalletServiceEnhancementTest.php`

**Interfaces:**
*   Consumes: Request Models from Task 2.
*   Produces: Updated repository & service queries and write actions matching the new Request Models.

- [ ] **Step 1: Update Repository Interface and Implementation**

Modify `app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php`:
Add imports:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
```
Add signatures:
```php
    /**
     * Get transactions based on filter model.
     */
    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transaction summary matching filters.
     */
    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request, float $currentBalance): array;
```

Modify `app/Repositories/ProfitWalletRepository.php`:
Add imports:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use Carbon\Carbon;
use App\Models\Transaction;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
```
Implement methods:
```php
    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection
    {
        $query = ProfitWalletTransaction::query()->with('reference');

        if ($request->start_date) {
            $startTimestamp = Carbon::parse($request->start_date)->startOfDay()->getTimestamp();
            $query->where('created_at', '>=', $startTimestamp);
        }
        if ($request->end_date) {
            $endTimestamp = Carbon::parse($request->end_date)->endOfDay()->getTimestamp();
            $query->where('created_at', '<=', $endTimestamp);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->transaction_type) {
            $query->where('transaction_type', $request->transaction_type);
        }
        if ($request->keyword) {
            $query->where(function ($q) use ($request) {
                $q->where('notes', 'ilike', "%{$request->keyword}%")
                  ->orWhere(function ($sub) use ($request) {
                      $sub->where('reference_type', Transaction::class)
                          ->whereHasMorph('reference', [Transaction::class], function ($morphQuery) use ($request) {
                              $morphQuery->where('invoice_number', 'ilike', "%{$request->keyword}%");
                          });
                  });
            });
        }

        $query->orderBy('id', 'desc');

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request, float $currentBalance): array
    {
        $query = ProfitWalletTransaction::query();

        if ($request->start_date) {
            $query->where('created_at', '>=', Carbon::parse($request->start_date)->startOfDay()->getTimestamp());
        }
        if ($request->end_date) {
            $query->where('created_at', '<=', Carbon::parse($request->end_date)->endOfDay()->getTimestamp());
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->transaction_type) {
            $query->where('transaction_type', $request->transaction_type);
        }
        if ($request->keyword) {
            $query->where(function ($q) use ($request) {
                $q->where('notes', 'ilike', "%{$request->keyword}%")
                  ->orWhere(function ($sub) use ($request) {
                      $sub->where('reference_type', Transaction::class)
                          ->whereHasMorph('reference', [Transaction::class], function ($morphQuery) use ($request) {
                              $morphQuery->where('invoice_number', 'ilike', "%{$request->keyword}%");
                          });
                  });
            });
        }

        return [
            'current_balance' => $currentBalance,
            'total_inflow' => (float) $query->clone()->where('type', 'in')->sum('amount'),
            'total_outflow' => (float) $query->clone()->where('type', 'out')->sum('amount'),
        ];
    }
```

- [ ] **Step 2: Update Service Interface and Implementation**

Modify `app/Support/Interfaces/Services/ProfitWalletServiceInterface.php`:
Add imports:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
```
Modify signature parameters:
```php
    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection;
    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request): array;
    public function disburse(DisburseProfitWalletReqModel $request): ProfitWalletTransaction;
    public function withdrawCapital(WithdrawCapitalProfitWalletReqModel $request): ProfitWalletTransaction;
```

Modify `app/Services/ProfitWalletService.php`:
Add imports:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
```
Implement and update methods:
```php
    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection
    {
        try {
            return $this->profitWalletRepository->getTransactions($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request): array
    {
        try {
            $wallet = $this->getOrCreateWallet();
            return $this->profitWalletRepository->getTransactionSummary($request, (float) $wallet->balance);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function disburse(DisburseProfitWalletReqModel $request): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception('Amount must be greater than zero.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                if ($before < $request->amount) {
                    throw new Exception('Insufficient wallet balance for disbursement.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $request->amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => 'out',
                    'transaction_type' => 'disbursement',
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Disbursement to owner bank account',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function withdrawCapital(WithdrawCapitalProfitWalletReqModel $request): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception('Amount must be greater than zero.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                if ($before < $request->amount) {
                    throw new Exception('Insufficient wallet balance for capital withdrawal.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $request->amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => 'out',
                    'transaction_type' => 'capital_withdrawal',
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Reinvestment/business capital withdrawal',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
```

- [ ] **Step 3: Write tests verifying enhancements**

`tests/Feature/ProfitWallet/ProfitWalletServiceEnhancementTest.php`:
```php
<?php

use App\Models\ProfitWalletTransaction;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ProfitWalletServiceInterface::class);
});

test('service getTransactions returns correct paginated items and summary', function () {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);
    $this->service->recordSalesProfit(500.00, 2);

    $req = new GetProfitWalletTransactionReqModel(new Request(['limit' => 10]));
    $list = $this->service->getTransactions($req);
    $summary = $this->service->getTransactionSummary($req);

    expect($list)->toHaveCount(2)
        ->and($summary['current_balance'])->toEqual(1500.00)
        ->and($summary['total_inflow'])->toEqual(1500.00)
        ->and($summary['total_outflow'])->toEqual(0.00);
});

test('service disburse accepts DisburseProfitWalletReqModel', function () {
    $wallet = $this->service->getOrCreateWallet();
    $this->service->recordSalesProfit(1000.00, 1);

    $disburseReq = new DisburseProfitWalletReqModel(new Request(['amount' => 400.00, 'notes' => 'Weekly payout']));
    $tx = $this->service->disburse($disburseReq);

    expect($tx->balance_after)->toEqual(600.00)
        ->and($tx->notes)->toBe('Weekly payout');
});
```

- [ ] **Step 4: Run Service unit tests**

Run: `php artisan test tests/Feature/ProfitWallet/ --compact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Support/Interfaces/Repositories/ProfitWalletRepositoryInterface.php app/Repositories/ProfitWalletRepository.php app/Support/Interfaces/Services/ProfitWalletServiceInterface.php app/Services/ProfitWalletService.php tests/Feature/ProfitWallet/ProfitWalletServiceEnhancementTest.php
git commit -m "feat: enhance repository and service layers to use request models"
```

---

### Task 4: API Controller and Route Integration

**Files:**
*   Create: `app/Http/Controllers/Api/ApiProfitWalletController.php`
*   Modify: `routes/web.php`
*   Create: `tests/Feature/ProfitWallet/ApiProfitWalletControllerTest.php`

**Interfaces:**
*   Consumes: `ProfitWalletServiceInterface` and `ProfitWalletPermissionEnums`.
*   Produces: HTTP API endpoints for e-wallet.

- [ ] **Step 1: Write API Controller**

`app/Http/Controllers/Api/ApiProfitWalletController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfitWallet\IndexProfitWalletRequest;
use App\Http\Requests\ProfitWallet\DisburseProfitWalletRequest;
use App\Http\Requests\ProfitWallet\WithdrawCapitalProfitWalletRequest;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use App\Models\Transaction;
use App\Support\Enums\ProfitWalletPermissionEnums;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiProfitWalletController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ProfitWalletServiceInterface $profitWalletService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value, only: ['index']),
            new Middleware('permission:'.ProfitWalletPermissionEnums::DISBURSE_PROFIT_WALLET->value, only: ['disburse']),
            new Middleware('permission:'.ProfitWalletPermissionEnums::WITHDRAW_CAPITAL_PROFIT_WALLET->value, only: ['withdrawCapital']),
        ];
    }

    public function index(IndexProfitWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new GetProfitWalletTransactionReqModel($request);
            
            $summary = $this->profitWalletService->getTransactionSummary($reqModel);
            $paginated = $this->profitWalletService->getTransactions($reqModel);

            $mappedData = collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'amount' => (float) $item->amount,
                    'type' => $item->type,
                    'transaction_type' => $item->transaction_type,
                    'balance_before' => (float) $item->balance_before,
                    'balance_after' => (float) $item->balance_after,
                    'notes' => $item->notes,
                    'invoice_number' => $item->reference_type === Transaction::class ? ($item->reference->invoice_number ?? '-') : '-',
                    'created_at' => (int) $item->created_at,
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
                    ],
                ],
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 500);
        }
    }

    public function disburse(DisburseProfitWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new DisburseProfitWalletReqModel($request);
            $tx = $this->profitWalletService->disburse($reqModel);
            
            return ResponseApi::make(true, trans('message.success.success'), [
                'transaction_id' => $tx->id,
                'amount' => (float) $tx->amount,
                'balance_after' => (float) $tx->balance_after,
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 422);
        }
    }

    public function withdrawCapital(WithdrawCapitalProfitWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new WithdrawCapitalProfitWalletReqModel($request);
            $tx = $this->profitWalletService->withdrawCapital($reqModel);
            
            return ResponseApi::make(true, trans('message.success.success'), [
                'transaction_id' => $tx->id,
                'amount' => (float) $tx->amount,
                'balance_after' => (float) $tx->balance_after,
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 422);
        }
    }
}
```

- [ ] **Step 2: Modify Routes**

Modify `routes/web.php`:
Add import:
```php
use App\Http\Controllers\Api\ApiProfitWalletController;
```
Inside the `api` group:
```php
        // profit wallet
        Route::get('/profit-wallet', [ApiProfitWalletController::class, 'index'])->name('apiProfitWallet.index');
        Route::post('/profit-wallet/disburse', [ApiProfitWalletController::class, 'disburse'])->name('apiProfitWallet.disburse');
        Route::post('/profit-wallet/withdraw-capital', [ApiProfitWalletController::class, 'withdrawCapital'])->name('apiProfitWallet.withdrawCapital');
```

- [ ] **Step 3: Write integration tests for API controller**

`tests/Feature/ProfitWallet/ApiProfitWalletControllerTest.php`:
```php
<?php

use App\Models\User;
use App\Support\Enums\ProfitWalletPermissionEnums;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RoleSeeder;
use Database\Seeders\PermissionSeeder;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
    $this->service = app(ProfitWalletServiceInterface::class);
});

test('api endpoints require authentication and permissions', function () {
    $this->getJson(route('apiProfitWallet.index'))->assertStatus(401);

    $userWithoutPerm = User::factory()->create();
    $this->actingAs($userWithoutPerm);
    $this->getJson(route('apiProfitWallet.index'))->assertStatus(403);
});

test('api index returns wallet transactions and summary', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);

    $this->service->recordSalesProfit(1200.00, 1);

    $response = $this->getJson(route('apiProfitWallet.index', ['limit' => 10]));
    $response->assertStatus(200)
        ->assertJsonPath('data.summary.current_balance', 1200.00)
        ->assertJsonCount(1, 'data.transactions.data');
});

test('api disburse executes payout successfully', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);

    $this->service->recordSalesProfit(1500.00, 1);

    $response = $this->postJson(route('apiProfitWallet.disburse'), [
        'amount' => 500.00,
        'notes' => 'Payout'
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.balance_after', 1000.00);
});
```

- [ ] **Step 4: Run all API tests**

Run: `php artisan test tests/Feature/ProfitWallet/ --compact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Api/ApiProfitWalletController.php routes/web.php tests/Feature/ProfitWallet/ApiProfitWalletControllerTest.php
git commit -m "feat: implement api controller and routes for profit wallet"
```
