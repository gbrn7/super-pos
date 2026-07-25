# Design Specification: Profit Wallet Datatable & Action APIs

*   **Date:** 2026-07-25
*   **Author:** Antigravity AI
*   **Status:** Pending Review

---

## 1. Problem Statement & Goals

The frontend needs clean, secure, and filtered API endpoints to render the profit wallet datatable, show transaction summaries (current balance, total inflow, total outflow), and trigger actions (disbursing funds and withdrawing capital). To keep the codebase uniform and adhere to modular principles, all data querying and business logic orchestration must follow the **Service-Repository Pattern** using typed **Request Models** for parameter passing.

### Objectives:
*   Define Spatie permissions for reading, disbursing, and withdrawing capital from the profit wallet.
*   Seed permissions and bind them to the Admin role in `PermissionSeeder`.
*   Expose endpoints under the `/api` route group with appropriate middleware.
*   Encapsulate request parameters in typed Request Models.
*   Implement repository queries for retrieving paginated ledger transactions and calculating summaries.
*   Expose actions through the service layer using Request Models.
*   Provide clean JSON responses via `ResponseApi` to the frontend.

---

## 2. Proposed Architecture & Schema

We will create a new API controller, three Form Request classes, three Request Models, and expand the repository and service classes.

### 2.1 Permissions Setup

A new permission enum `ProfitWalletPermissionEnums` will define the permissions:
- `read-profit-wallet`: To view datatable and summary.
- `disburse-profit-wallet`: To disburse wallet balance.
- `withdraw-capital-profit-wallet`: To withdraw capital.

These will be seeded in `PermissionSeeder` and granted to the `admin` role.

### 2.2 Routes (`routes/web.php`)

Registered under the `'api'` prefix and `auth`/`verified` middleware:
```php
Route::get('/profit-wallet', [ApiProfitWalletController::class, 'index'])->name('apiProfitWallet.index');
Route::post('/profit-wallet/disburse', [ApiProfitWalletController::class, 'disburse'])->name('apiProfitWallet.disburse');
Route::post('/profit-wallet/withdraw-capital', [ApiProfitWalletController::class, 'withdrawCapital'])->name('apiProfitWallet.withdrawCapital');
```

---

## 3. Class Definitions & Code Blocks

### 3.1 Request Models (`app/Support/Models/ProfitWallet/...`)

#### A. `GetProfitWalletTransactionReqModel.php`
```php
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

#### B. `DisburseProfitWalletReqModel.php`
```php
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

#### C. `WithdrawCapitalProfitWalletReqModel.php`
```php
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

### 3.2 Form Requests (`app/Http/Requests/ProfitWallet/...`)

#### A. `IndexProfitWalletRequest.php`
```php
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

#### B. `DisburseProfitWalletRequest.php`
```php
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

#### C. `WithdrawCapitalProfitWalletRequest.php`
```php
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

### 3.3 Repository Methods (`ProfitWalletRepositoryInterface.php` & `ProfitWalletRepository.php`)

Add the following signatures to `ProfitWalletRepositoryInterface`:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection;
public function getTransactionSummary(GetProfitWalletTransactionReqModel $request, float $currentBalance): array;
```

Implement in `ProfitWalletRepository`:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use Carbon\Carbon;
use App\Models\Transaction;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

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

### 3.4 Service Methods (`ProfitWalletServiceInterface.php` & `ProfitWalletService.php`)

Add the following signatures to `ProfitWalletServiceInterface` (and update `disburse`/`withdrawCapital` parameters):
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection;
public function getTransactionSummary(GetProfitWalletTransactionReqModel $request): array;
public function disburse(DisburseProfitWalletReqModel $request): ProfitWalletTransaction;
public function withdrawCapital(WithdrawCapitalProfitWalletReqModel $request): ProfitWalletTransaction;
```

Update in `ProfitWalletService`:
```php
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

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

### 3.5 API Controller (`ApiProfitWalletController.php`)

```php
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

---

## 4. Testing & Verification

We will write Pest tests in `tests/Feature/ProfitWallet/ApiProfitWalletControllerTest.php` verifying:
*   **Authentication & Permissions**: Ensure endpoints are blocked if unauthenticated or missing permission.
*   **Listing and Filtering**: Ensure transactions are returned paginated, filtered correctly by date ranges, keyword, and transaction types.
*   **Action Validation**: Ensure disburse and withdraw endpoints correctly invoke the services using Request Models and return formatted responses, and reject requests with zero/negative amounts or insufficient balances.
