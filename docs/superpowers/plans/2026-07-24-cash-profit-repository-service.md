# 2026-07-24 Cash Profit Repository Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Cash Profit backend implementation to use the Repository-Service Design Pattern.

**Architecture:** We will create a `GetCashProfitReqModel` to capture filtering/sorting requests. We will extract direct Eloquent queries from `ApiCashProfitController` into `CashProfitRepository` and `CashProfitService` using interface-based dependency injection. Finally, we will register the bindings in `AppServiceProvider`.

**Tech Stack:** Laravel, PHP 8.4, Eloquent.

## Global Constraints

- Target database table name: `cash_profits`.
- Follow strict repository/service interface bindings in `AppServiceProvider`.
- Run Pint after modifying PHP code.
- Ensure all tests pass.

---

### Task 1: Create Request Model, Repository Interface, and Repository Implementation

**Files:**
- Create: `app/Support/Models/CashProfit/GetCashProfitReqModel.php`
- Create: `app/Support/Interfaces/Repositories/CashProfitRepositoryInterface.php`
- Create: `app/Repositories/CashProfitRepository.php`

**Interfaces:**
- Produces: `CashProfitRepositoryInterface` for binding and injecting in the Service.

- [ ] **Step 1: Create Request Model**

Create `app/Support/Models/CashProfit/GetCashProfitReqModel.php`:
```php
<?php

namespace App\Support\Models\CashProfit;

use Illuminate\Http\Request;

class GetCashProfitReqModel
{
    public ?int $user_id;
    public ?int $payment_method_id;
    public ?string $start_date;
    public ?string $end_date;
    public ?string $keyword;
    public ?int $page;
    public ?int $limit;
    public ?string $order_by;
    public ?string $order;

    public function __construct(Request $request)
    {
        $this->user_id = $request->query('user_id') ? (int) $request->query('user_id') : null;
        $this->payment_method_id = $request->query('payment_method_id') ? (int) $request->query('payment_method_id') : null;
        $this->start_date = $request->query('start_date');
        $this->end_date = $request->query('end_date');
        $this->keyword = $request->query('keyword');
        $this->page = $request->query('page') ? (int) $request->query('page') : 1;
        $this->limit = $request->query('limit') ? (int) $request->query('limit') : 10;
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
```

- [ ] **Step 2: Create Repository Interface**

Create `app/Support/Interfaces/Repositories/CashProfitRepositoryInterface.php`:
```php
<?php

namespace App\Support\Interfaces\Repositories;

use App\Support\Models\CashProfit\GetCashProfitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CashProfitRepositoryInterface
{
    public function getAllByIndex(GetCashProfitReqModel $request): Paginator|Collection;
    public function getSummary(GetCashProfitReqModel $request): array;
}
```

- [ ] **Step 3: Create Repository Implementation**

Create `app/Repositories/CashProfitRepository.php`:
```php
<?php

namespace App\Repositories;

use App\Models\CashProfit;
use App\Support\Interfaces\Repositories\CashProfitRepositoryInterface;
use App\Support\Models\CashProfit\GetCashProfitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class CashProfitRepository implements CashProfitRepositoryInterface
{
    public function getAllByIndex(GetCashProfitReqModel $request): Paginator|Collection
    {
        $query = $this->buildQuery($request);

        if (isset($request->order_by) && isset($request->order)) {
            if ($request->order_by === 'profit') {
                $query->orderBy('profit', $request->order);
            } else {
                $query->orderBy('id', 'desc');
            }
        } else {
            $query->orderBy('id', 'desc');
        }

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit);
    }

    public function getSummary(GetCashProfitReqModel $request): array
    {
        $query = $this->buildQuery($request);

        return [
            'total_net_profit' => (float) $query->sum('profit'),
            'total_transactions' => $query->count(),
        ];
    }

    protected function buildQuery(GetCashProfitReqModel $request)
    {
        return CashProfit::query()
            ->with(['transaction.user', 'transaction.paymentMethod'])
            ->when($request->start_date, function ($query) use ($request) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->whereDate('created_at', '>=', $request->start_date);
                });
            })
            ->when($request->end_date, function ($query) use ($request) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->whereDate('created_at', '<=', $request->end_date);
                });
            })
            ->when($request->user_id, function ($query) use ($request) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->where('user_id', $request->user_id);
                });
            })
            ->when($request->payment_method_id, function ($query) use ($request) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->where('payment_method_id', $request->payment_method_id);
                });
            })
            ->when($request->keyword, function ($query) use ($request) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->where('invoice_number', 'ilike', "%{$request->keyword}%");
                });
            });
    }
}
```

- [ ] **Step 4: Commit**
```bash
git add app/Support/Models/CashProfit/GetCashProfitReqModel.php app/Support/Interfaces/Repositories/CashProfitRepositoryInterface.php app/Repositories/CashProfitRepository.php
git commit -m "feat: implement GetCashProfitReqModel and CashProfitRepository"
```

---

### Task 2: Create Service Interface and Service Implementation

**Files:**
- Create: `app/Support/Interfaces/Services/CashProfitServiceInterface.php`
- Create: `app/Services/CashProfitService.php`

**Interfaces:**
- Consumes: `CashProfitRepositoryInterface`
- Produces: `CashProfitServiceInterface` for injecting in the Controller.

- [ ] **Step 1: Create Service Interface**

Create `app/Support/Interfaces/Services/CashProfitServiceInterface.php`:
```php
<?php

namespace App\Support\Interfaces\Services;

use App\Support\Models\CashProfit\GetCashProfitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CashProfitServiceInterface
{
    public function getAllByIndex(GetCashProfitReqModel $request): Paginator|Collection;
    public function getSummary(GetCashProfitReqModel $request): array;
}
```

- [ ] **Step 2: Create Service Implementation**

Create `app/Services/CashProfitService.php`:
```php
<?php

namespace App\Services;

use App\Support\Interfaces\Repositories\CashProfitRepositoryInterface;
use App\Support\Interfaces\Services\CashProfitServiceInterface;
use App\Support\Models\CashProfit\GetCashProfitReqModel;
use App\Support\Utils\CheckException;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class CashProfitService implements CashProfitServiceInterface
{
    public function __construct(
        protected CashProfitRepositoryInterface $cashProfitRepository
    ) {}

    public function getAllByIndex(GetCashProfitReqModel $request): Paginator|Collection
    {
        try {
            return $this->cashProfitRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getSummary(GetCashProfitReqModel $request): array
    {
        try {
            return $this->cashProfitRepository->getSummary($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add app/Support/Interfaces/Services/CashProfitServiceInterface.php app/Services/CashProfitService.php
git commit -m "feat: implement CashProfitServiceInterface and CashProfitService"
```

---

### Task 3: Register Bindings, Controller Refactoring, and Verification

**Files:**
- Modify: `app/Providers/AppServiceProvider.php`
- Modify: `app/Http/Controllers/Api/ApiCashProfitController.php`

- [ ] **Step 1: Register Service & Repository Bindings**

Modify `app/Providers/AppServiceProvider.php` to import and bind CashProfit repository and service interfaces.

- [ ] **Step 2: Refactor ApiCashProfitController**

Refactor `ApiCashProfitController.php` to inject `CashProfitServiceInterface` and resolve queries through it.

- [ ] **Step 3: Run Pint**
Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 4: Run Tests**
Run: `php artisan test --compact --filter=Transaction`

- [ ] **Step 5: Commit**
```bash
git add app/Providers/AppServiceProvider.php app/Http/Controllers/Api/ApiCashProfitController.php
git commit -m "feat: bind CashProfit service/repository and refactor controller"
```
