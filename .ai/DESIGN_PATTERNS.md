# PRAKTIS POS — Design Pattern & Architecture Guide

> This document is intended for AI Agents / Coding Assistants to understand the architecture, conventions, and design patterns used in the **PRAKTIS POS** project.  
> **Always follow these patterns when creating new features.**

---

## 1. Core Architecture

This project uses the **Repository-Service-Controller (RSC) Pattern** with dependency injection through the Laravel Service Container.

```
Request → Route → Controller → Service → Repository → Model → Database
                      ↓              ↓            ↓
                 FormRequest    Interface     Interface
                 Resource       CheckException
                 ResponseApi
```

### Data Flow (Request → Response)

1. **Route** (`routes/web.php`) receives the request and forwards it to a Controller.
2. **Controller** receives the request, validates via **FormRequest**, and calls the **Service**.
3. **Service** contains business logic and calls the **Repository** for data access.
4. **Repository** interacts directly with the **Model** (Eloquent) for database queries.
5. The response is returned via **API Resource** and wrapped by the **ResponseApi** utility.

### Key Principles

- **Controller** MUST NOT access Repository directly. Always go through Service.
- **Service** MUST NOT access Model directly. Always go through Repository.
- **Repository** is the only layer that interacts with Eloquent Models.
- All dependencies are injected through **Interfaces**, not concrete classes.
- All Interface → Implementation bindings are registered in `AppServiceProvider`.

---

## 2. Directory Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/                          # API Controllers (JSON response)
│   │   │   ├── ApiCategoryController.php
│   │   │   ├── ApiUnitController.php
│   │   │   └── ...
│   │   ├── CategoryController.php        # Web Controllers (Inertia pages)
│   │   ├── UnitController.php
│   │   └── ...
│   ├── Requests/
│   │   ├── Category/
│   │   │   ├── StoreCategoryRequest.php
│   │   │   ├── UpdateCategoryRequest.php
│   │   │   └── BulkDeleteCategoryRequest.php
│   │   └── {ModelName}/                  # One folder per model
│   └── Resources/
│       ├── CategoryResource.php
│       └── ...
├── Models/
│   ├── Category.php
│   └── ...
├── Repositories/
│   ├── CategoryRepository.php
│   └── ...
├── Services/
│   ├── CategoryService.php
│   └── ...
├── Support/
│   ├── Constants/
│   │   ├── Constants.php
│   │   ├── ErrorCode.php
│   │   └── Header.php
│   ├── Enums/
│   │   ├── CategoryPermissionEnums.php
│   │   ├── RoleEnums.php
│   │   └── ...
│   ├── Interfaces/
│   │   ├── Repositories/
│   │   │   ├── CategoryRepositoryInterface.php
│   │   │   └── ...
│   │   └── Services/
│   │       ├── CategoryServiceInterface.php
│   │       └── ...
│   ├── Models/                           # Request DTO / Query Parameter Models
│   │   ├── Category/
│   │   │   └── GetCategoryReqModel.php
│   │   └── {ModelName}/
│   └── Utils/
│       ├── CheckException.php
│       └── ResponseApi.php
├── Providers/
│   └── AppServiceProvider.php            # Interface → Implementation bindings
database/
├── factories/
│   ├── CategoryFactory.php
│   └── ...
├── migrations/
routes/
│   └── web.php                           # All routes (web + api prefix)
tests/
├── Feature/
│   ├── Category/
│   │   └── CategoryTest.php
│   └── {ModelName}/
└── Pest.php
```

---

## 3. Step-by-Step Guide for Creating a New Feature

Example: creating CRUD functionality for a **"Unit"** entity.

### Step 1: Model (`app/Models/Unit.php`)

```php
<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // format date using unix/epoch time
    protected $dateFormat = 'U';

    // override default iso datetime format from model
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }
}
```

**Conventions:**
- Use the `HasFactory` trait.
- Define `$fillable` explicitly.
- If the table uses unix timestamps, set `$dateFormat = 'U'` and override `serializeDate()`.

---

### Step 2: Migration (`database/migrations/xxxx_create_units_table.php`)

```php
Schema::create('units', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->unsignedBigInteger('created_at');
    $table->unsignedBigInteger('updated_at');
});
```

**Conventions:**
- Some tables use standard `$table->timestamps()`, others use `unsignedBigInteger` (unix). Follow the related model's convention.

---

### Step 3: Factory (`database/factories/UnitFactory.php`)

```php
<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
        ];
    }
}
```

**Conventions:**
- Always create a factory alongside a new model.
- Use the `fake()` helper to generate data.
- For foreign key relations, use `RelatedModel::factory()` instead of `fake()->numberBetween()`.

---

### Step 4: Request DTO / Query Model (`app/Support/Models/Unit/GetUnitReqModel.php`)

```php
<?php

namespace App\Support\Models\Unit;

use Illuminate\Http\Request;

class GetUnitReqModel
{
    public ?string $name;
    public ?int $page;
    public ?int $limit;
    public ?string $order_by;
    public ?string $order;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
```

**Conventions:**
- Namespace: `App\Support\Models\{ModelName}`
- Class name: `Get{ModelName}ReqModel`
- Nullable properties (`?type`), populated from `$request->query()`.
- Always include at minimum: `page`, `limit`, `order_by`, `order`.

---

### Step 5: Repository Interface (`app/Support/Interfaces/Repositories/UnitRepositoryInterface.php`)

```php
<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Unit;
use App\Support\Models\Unit\GetUnitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface UnitRepositoryInterface
{
    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection;
    public function getById(int $id): ?Unit;
    public function create(array $data): Unit;
    public function update(Unit $unit, array $data): bool;
    public function delete(Unit $unit): bool;
    public function deleteMany(array $ids): int;
    public function insert(array $data): bool;
    public function getByName(string $name): ?Unit;
    public function getByNameExceptID(string $name, int $id): ?Unit;
}
```

**Conventions:**
- Namespace: `App\Support\Interfaces\Repositories`
- Name: `{ModelName}RepositoryInterface`
- `update()` and `delete()` accept a Model instance, not an ID.
- `getAllByIndex()` accepts `Get{ModelName}ReqModel`.
- Each method has a PHPDoc block.

---

### Step 6: Repository Implementation (`app/Repositories/UnitRepository.php`)

```php
<?php

namespace App\Repositories;

use App\Models\Unit;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class UnitRepository implements UnitRepositoryInterface
{
    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection
    {
        $query = Unit::query()
            ->orderBy(
                isset($request->order_by) ? $request->order_by : 'id',
                isset($request->order) ? $request->order : 'desc'
            )
            ->when($request->name, fn($query) => $query->where('name', 'ilike', "%{$request->name}%"));

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?Unit
    {
        return Unit::find($id);
    }

    public function create(array $data): Unit
    {
        return Unit::create($data);
    }

    public function update(Unit $unit, array $data): bool
    {
        return $unit->update($data);
    }

    public function delete(Unit $unit): bool
    {
        return $unit->delete();
    }

    public function deleteMany(array $ids): int
    {
        return Unit::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return Unit::insert($data);
    }

    public function getByName(string $name): ?Unit
    {
        return Unit::where('name', $name)->first();
    }

    public function getByNameExceptID(string $name, int $id): ?Unit
    {
        return Unit::where('name', $name)->where('id', '!=', $id)->first();
    }
}
```

**Conventions:**
- Implements the related interface.
- `getAllByIndex()`: default order is `id desc`, use `when()` for conditional filters.
- If `limit` is null → `get()`, if present → `paginate()->onEachSide(1)`.
- Text searches use `ilike` (PostgreSQL case-insensitive).

---

### Step 7: Service Interface (`app/Support/Interfaces/Services/UnitServiceInterface.php`)

```php
<?php

namespace App\Support\Interfaces\Services;

use App\Models\Unit;
use App\Support\Models\Unit\GetUnitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface UnitServiceInterface
{
    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection;
    public function getById(int $id): ?Unit;
    public function create(array $data): Unit;
    public function update(int $id, array $data): ?Unit;  // Accepts ID, not Model
    public function delete(int $id): bool;                  // Accepts ID, not Model
    public function bulkDelete(array $ids): int;
}
```

**Key differences vs Repository Interface:**
- Service `update()` and `delete()` accept an **ID** (int), not a Model instance.
- Service adds a `bulkDelete()` method as an alias for `deleteMany()`.
- Service does NOT expose `insert()`, `getByName()`, `getByNameExceptID()` (those are internal repository methods).

---

### Step 8: Service Implementation (`app/Services/UnitService.php`)

```php
<?php

namespace App\Services;

use App\Models\Unit;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Interfaces\Services\UnitServiceInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class UnitService implements UnitServiceInterface
{
    public function __construct(protected UnitRepositoryInterface $unitRepository) {}

    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection
    {
        try {
            return $this->unitRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?Unit
    {
        try {
            return $this->unitRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): Unit
    {
        try {
            // Check for name duplication
            $isUnitExist = $this->unitRepository->getByName($data['name']);

            if (isset($isUnitExist)) {
                throw new Exception(
                    trans('message.error.data_already_exists'),
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return $this->unitRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?Unit
    {
        try {
            // Find data, throw 404 if not found
            $unit = $this->unitRepository->getById($id);
            if (! isset($unit)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            // Check for name duplication (excluding own ID)
            $isUnitExist = $this->unitRepository->getByNameExceptID($data['name'], $id);
            if (isset($isUnitExist)) {
                throw new Exception(
                    trans('message.error.data_already_exists'),
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $isSuccess = $this->unitRepository->update($unit, $data);
            if (! $isSuccess) {
                throw new Exception(
                    trans('message.error.internal_server_error'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            return $unit;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $unit = $this->unitRepository->getById($id);
            if (! isset($unit)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->unitRepository->delete($unit);
            if (! $isSuccess) {
                throw new Exception(
                    trans('message.error.internal_server_error'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            return true;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function bulkDelete(array $ids): int
    {
        try {
            return $this->unitRepository->deleteMany($ids);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
```

**Conventions:**
- Inject Repository via constructor property promotion: `__construct(protected UnitRepositoryInterface $unitRepository) {}`
- **ALL** methods are wrapped in `try/catch` with `CheckException::Check($th)`.
- Business logic (duplication checks, not found) lives in the Service, NOT in the Repository or Controller.
- Use `trans()` for error messages.
- HTTP status codes: `422` (duplicate), `404` (not found), `500` (server error).

---

### Step 9: Permission Enum (`app/Support/Enums/UnitPermissionEnums.php`)

```php
<?php

namespace App\Support\Enums;

enum UnitPermissionEnums: string
{
    case CREATE_UNIT = 'create-unit';
    case READ_UNIT = 'read-unit';
    case UPDATE_UNIT = 'update-unit';
    case DELETE_UNIT = 'delete-unit';
}
```

**Conventions:**
- Backed enum (`string`).
- Case format: `{ACTION}_{MODEL}` → `CREATE_UNIT`.
- Value format: `{action}-{model}` → `'create-unit'`.
- Always 4 permissions: CREATE, READ, UPDATE, DELETE.

---

### Step 10: API Resource (`app/Http/Resources/UnitResource.php`)

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
```

**Conventions:**
- For simple models, `parent::toArray()` is sufficient.
- For models with relations, create explicit mappings (see `ProductResource` as an example).

---

### Step 11: Form Requests (`app/Http/Requests/Unit/`)

**StoreUnitRequest.php:**
```php
class StoreUnitRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique(Unit::class)],
        ];
    }
}
```

**UpdateUnitRequest.php:**
```php
class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['string', 'required', 'max:255'],
        ];
    }
}
```

**BulkDeleteUnitRequest.php:**
```php
class BulkDeleteUnitRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
        ];
    }
}
```

**Conventions:**
- One folder per model: `app/Http/Requests/{ModelName}/`
- Minimum 3 files: `Store{Model}Request`, `Update{Model}Request`, `BulkDelete{Model}Request`.
- `authorize()` returns `true` (authorization is handled by permission middleware).
- `Store` typically has `Rule::unique()`, `Update` does not (handled in Service).

---

### Step 12: Web Controller (`app/Http/Controllers/UnitController.php`)

```php
<?php

namespace App\Http\Controllers;

use App\Support\Enums\UnitPermissionEnums;
use App\Support\Interfaces\Services\UnitServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UnitController extends Controller implements HasMiddleware
{
    public function __construct(protected UnitServiceInterface $unitService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . UnitPermissionEnums::READ_UNIT->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('{model}/index');  // e.g., 'unit/index'
    }
}
```

**Conventions:**
- Implements `HasMiddleware`.
- Only an `index()` method for rendering the Inertia page.
- Inject Service via constructor.
- Permission middleware uses the Enum.

---

### Step 13: API Controller (`app/Http/Controllers/Api/ApiUnitController.php`)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Unit\BulkDeleteUnitRequest;
use App\Http\Requests\Unit\StoreUnitRequest;
use App\Http\Requests\Unit\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Support\Enums\UnitPermissionEnums;
use App\Support\Interfaces\Services\UnitServiceInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiUnitController extends Controller implements HasMiddleware
{
    public function __construct(protected UnitServiceInterface $unitService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . UnitPermissionEnums::READ_UNIT->value,
                only: ['index', 'show']
            ),
            new Middleware(
                'permission:' . UnitPermissionEnums::CREATE_UNIT->value,
                only: ['store']
            ),
            new Middleware(
                'permission:' . UnitPermissionEnums::UPDATE_UNIT->value,
                only: ['update']
            ),
            new Middleware(
                'permission:' . UnitPermissionEnums::DELETE_UNIT->value,
                only: ['destroy', 'bulkDelete']
            ),
        ];
    }

    public function index(Request $request)
    {
        try {
            $units = $this->unitService->getAllByIndex(new GetUnitReqModel($request));
            $data = UnitResource::collection($units);
            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    public function store(StoreUnitRequest $request)
    {
        try {
            $unit = $this->unitService->create($request->validated());
            return ResponseApi::make(true, trans('message.success.created'), $unit, Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    public function show(string $id)
    {
        try {
            $data = $this->unitService->getById($id);
            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    public function update(UpdateUnitRequest $request, string $id)
    {
        try {
            $unit = $this->unitService->update($id, $request->validated());
            return ResponseApi::make(true, trans('message.success.updated'), $unit);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    public function destroy(string $id)
    {
        try {
            $isSuccessDelete = $this->unitService->delete($id);
            if (! $isSuccessDelete) {
                throw new Exception(
                    trans('message.error.internal_server_error'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }
            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    public function bulkDelete(BulkDeleteUnitRequest $request)
    {
        try {
            $deletedCount = $this->unitService->bulkDelete($request->validated('ids'));
            return ResponseApi::make(
                true,
                trans('message.success.bulk_deleted', ['count' => $deletedCount]),
                null,
                Response::HTTP_OK
            );
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }
}
```

**Conventions:**
- Class prefix: `Api{ModelName}Controller`.
- ALL methods are wrapped in `try/catch`.
- Success response: `ResponseApi::make(true, message, data, httpCode)`.
- Error response: `ResponseApi::make(false, $th->getMessage(), null, $th->getCode())`.
- `store()` returns `Response::HTTP_CREATED` (201).
- `destroy()` and `bulkDelete()` return `Response::HTTP_OK` (200).
- Use `$request->validated()` for validated data.

#### API Permission Middleware Guidelines

API Controllers protect endpoints using Spatie Permission Middleware via Laravel's `HasMiddleware` interface:

```php
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiUnitController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . UnitPermissionEnums::READ_UNIT->value,
                only: ['index', 'show', 'all']
            ),
            new Middleware(
                'permission:' . UnitPermissionEnums::CREATE_UNIT->value,
                only: ['store']
            ),
            new Middleware(
                'permission:' . UnitPermissionEnums::UPDATE_UNIT->value,
                only: ['update']
            ),
            new Middleware(
                'permission:' . UnitPermissionEnums::DELETE_UNIT->value,
                only: ['destroy', 'bulkDelete']
            ),
        ];
    }
}
```

**Middleware Rules:**
1. **HasMiddleware Interface**: Controllers MUST implement `Illuminate\Routing\Controllers\HasMiddleware` and define static `middleware(): array`.
2. **Permission Enum Mapping**: Always use backed string Enums (e.g. `'permission:' . ModelPermissionEnums::ACTION_MODEL->value`), never hardcode permission strings.
3. **Endpoint Grouping (`only`)**:
   - `READ`: `['index', 'show', 'all']` (or custom listing/export endpoints)
   - `CREATE`: `['store', 'bulkStore']`
   - `UPDATE`: `['update', 'bulkUpdate']`
   - `DELETE`: `['destroy', 'bulkDelete']`
4. **New Custom Endpoints**: When adding new controller methods (such as `all()`, `export()`, `import()`), ALWAYS add the method name to the appropriate permission middleware `only` array.

---

### Step 14: Service Provider Binding (`app/Providers/AppServiceProvider.php`)

```php
public function register(): void
{
    // Unit service
    $this->app->bind(UnitRepositoryInterface::class, UnitRepository::class);
    $this->app->bind(UnitServiceInterface::class, UnitService::class);
}
```

**Conventions:**
- Bind **Repository Interface → Repository Implementation**.
- Bind **Service Interface → Service Implementation**.
- Add a comment `// {ModelName} service` above the bindings.
- Import all classes in the `use` statements section.

---

### Step 15: Route Registration (`routes/web.php`)

```php
// Inside Route::middleware(['auth', 'verified'])->group()

// Web route (Inertia page)
Route::resource('units', UnitController::class)->only('index');

// Inside Route::group(['prefix' => 'api'])

// API CRUD resource
Route::resource('unit', ApiUnitController::class)
    ->names('apiUnits')
    ->only(['index', 'store', 'show', 'update', 'destroy']);

// Custom routes (bulk delete, etc.)
Route::group(['prefix' => 'unit'], function () {
    Route::post('/bulk-delete', [ApiUnitController::class, 'bulkDelete'])
        ->name('apiUnits.bulkDelete');
});
```

**Conventions:**
- Web route: plural (`units`), only `index`.
- API resource: singular or contextual, with `->names('api{Models}')`.
- Custom endpoints (bulk-delete, etc.) in a separate group with the same prefix.
- Route naming: `api{Models}.{method}` → `apiUnits.bulkDelete`.

---

### Step 16: Testing (`tests/Feature/{ModelName}/`)

```php
<?php

use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('get unit', function () {
    Unit::factory()->create();

    $response = $this
        ->actingAs(User::factory()->create())
        ->getJson(route('apiUnits.index'));

    $response->assertOk();
});

test('create unit', function () {
    $response = $this
        ->actingAs(User::factory()->create())
        ->postJson(route('apiUnits.store'), [
            'name' => fake()->unique()->word(),
        ]);

    $response->assertCreated();
});
```

**Conventions:**
- Framework: **Pest** (not PHPUnit).
- `uses(RefreshDatabase::class)` in each test file.
- Pest.php already configures `RefreshDatabase` globally for the `Feature` folder, but some test files still declare it explicitly.
- Use `test()` or `it()` syntax.
- Use `->actingAs()` for authentication.
- Use `->getJson()`, `->postJson()`, `->putJson()`, `->deleteJson()`.
- Assertions: `->assertOk()`, `->assertCreated()`, `->assertUnprocessable()`, `->assertNotFound()`.
- Factories for test data creation.

---

## 4. Utility Classes

### `ResponseApi` — Standard JSON Response

```php
ResponseApi::make(bool $isSuccess, string $message, mixed $data = null, ?int $httpCode = 200)
```

Response format:
```json
{
    "success": true,
    "message": "Success",
    "data": { ... }
}
```

### `CheckException` — Exception Sanitizer

```php
CheckException::Check(Exception $th): Exception
```

- Logs the error to the Laravel Log.
- If the code is not a valid HTTP status (100-599), returns a generic 500 error.
- If the code is valid, returns the original exception.

---

## 5. Multilingual Messages (i18n)

This project supports **2 languages**: Indonesian (`id`) and English (`en`). **Every new message MUST be added to both language files.**

### 5.1 Directory Structure

```
lang/
├── en/
│   ├── message.php       # App-specific messages (success, error)
│   └── validation.php    # Validation rule messages & attribute names
├── id/
│   ├── message.php       # App-specific messages (Indonesian)
│   └── validation.php    # Validation rule messages & attribute names (Indonesian)
```

### 5.2 Language Switching Mechanism

Language is determined per-request via the `x-language` HTTP header, handled by the `SetLanguage` middleware (`app/Http/Middleware/SetLanguage.php`):

```php
class SetLanguage
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['id', 'en'];

        $lang = $request->header(Header::X_LANGUAGE, 'id');  // default: Indonesian

        if (! in_array($lang, $supported)) {
            $lang = Header::X_LANGUAGE_DEFAULT_VALUE;  // fallback: 'id'
        }

        App::setLocale($lang);

        return $next($request);
    }
}
```

**Key points:**
- Default language is `id` (Indonesian).
- Client sends `x-language: en` or `x-language: id` header to switch language.
- The header constant is defined in `App\Support\Constants\Header`.
- This middleware is registered globally in `bootstrap/app.php`.

### 5.3 Message File Pattern (`lang/{locale}/message.php`)

Messages are organized into two groups: `success` and `error`.

**English (`lang/en/message.php`):**
```php
<?php

return [
    'success' => [
        'success'          => 'Success',
        'created'          => 'Data successfully created',
        'bulk_created'     => ':count data successfully created',
        'import_processing'=> 'Import is processing',
        'updated'          => 'Data successfully updated',
        'bulk_updated'     => ':count data successfully updated',
        'deleted'          => 'Data successfully deleted',
        'bulk_deleted'     => ':count data successfully deleted',
        'profile_updated'  => 'Profile updated',
        'password_updated' => 'Password updated',
    ],

    'error' => [
        'data_not_found'          => 'Data not found',
        'data_already_exists'     => 'Data already exist',
        'internal_server_error'   => 'Internal server error',
        'something_went_wrong'    => 'Something went wrong',
        'unauthorized'            => 'Unauthorized access',
        'validation'              => 'Validation failed',
        // ... domain-specific error messages
    ],
];
```

**Indonesian (`lang/id/message.php`):**
```php
<?php

return [
    'success' => [
        'success'          => 'Sukses',
        'created'          => 'Data berhasil dibuat',
        'bulk_created'     => ':count data berhasil dibuat',
        'import_processing'=> 'Impor sedang diproses',
        'updated'          => 'Data berhasil diperbarui',
        'bulk_updated'     => ':count data berhasil diperbarui',
        'deleted'          => 'Data berhasil dihapus',
        'bulk_deleted'     => ':count data berhasil dihapus',
        'profile_updated'  => 'Profil berhasil diperbarui',
        'password_updated' => 'Password diperbarui',
    ],

    'error' => [
        'data_not_found'          => 'Data tidak ditemukan',
        'data_already_exists'     => 'Data sudah tersedia',
        'internal_server_error'   => 'Kesalahan server internal',
        'something_went_wrong'    => 'Terjadi kesalahan',
        'unauthorized'            => 'Anda tidak memiliki izin',
        'validation'              => 'Validasi gagal',
        // ... domain-specific error messages
    ],
];
```

### 5.4 Validation File Pattern (`lang/{locale}/validation.php`)

Validation files contain three sections: **rule messages**, **min/max nested rules**, and **attribute names**.

**English (`lang/en/validation.php`):**
```php
<?php

return [
    'required'  => 'The :attribute field is required.',
    'string'    => 'The :attribute field must be a string.',
    'numeric'   => 'The :attribute field must be a number.',
    'array'     => 'The :attribute field must be a array.',
    'unique'    => 'The :attribute already exists',
    'confirmed' => 'The :attribute confirmation does not match',
    'boolean'   => ':attribute field must be a boolean',
    'mimes'     => 'the type of :attribute must on of :values',
    'exists'    => 'The selected :attribute is invalid.',

    'min' => [
        'string'  => 'The :attribute field must be at least :min characters.',
        'numeric' => 'The :attribute field must be at least :min.',
        'array'   => 'The :attribute field must have at least :min items.',
    ],

    'max' => [
        'file'    => 'The :attribute sized not to greater than :max Kb',
        'string'  => 'The :attribute field must not be greater than :max characters.',
        'numeric' => 'The :attribute field must not be greater than :max.',
    ],

    'attributes' => [
        'name'        => 'Name',
        'desc'        => 'Description',
        'permissions' => 'Permissions',
        'role'        => 'Role',
        'password'    => 'Password',
        'image'       => 'Image',
        'category_id' => 'Category',
        'unit_id'     => 'Unit',
        'stock'       => 'Stock',
        'price'       => 'Price',
        'cost_price'  => 'Cost Price',
        'is_active'   => 'Active Status',
        // ... add new model attributes here
    ],
];
```

**Indonesian (`lang/id/validation.php`):**
```php
<?php

return [
    'required'  => ':attribute wajib diisi.',
    'string'    => ':attribute harus berupa teks',
    'numeric'   => ':attribute harus berupa angka',
    'array'     => ':attribute harus berupa array',
    'unique'    => ':attribute sudah ada',
    'confirmed' => ':attribute konfirmasi tidak cocok',
    'boolean'   => ':attribute harus bertipe boolean',
    'mimes'     => ':attribute harus bertipe :values',
    'exists'    => ':attribute yang dipilih tidak valid',

    'min' => [
        'string'  => ':attribute minimal :min karakter',
        'numeric' => ':attribute minimal :min',
        'array'   => ':attribute minimal memiliki :min item',
    ],

    'max' => [
        'file'    => ':attribute maksimal :max Kb',
        'string'  => ':attribute maksimal :max karakter.',
        'numeric' => ':attribute maksimal :max.',
    ],

    'attributes' => [
        'name'        => 'Nama',
        'desc'        => 'Deskripsi',
        'permissions' => 'Hak akses',
        'role'        => 'Peran',
        'password'    => 'Kata sandi',
        'image'       => 'Gambar',
        'category_id' => 'Kategori',
        'unit_id'     => 'Satuan',
        'stock'       => 'Stok',
        'price'       => 'Harga',
        'cost_price'  => 'Harga Pokok',
        'is_active'   => 'Status Aktif',
        // ... add new model attributes here
    ],
];
```

### 5.5 How to Use Messages in Code

Always use the `trans()` helper to reference messages:

```php
// Success messages
trans('message.success.success')       // "Success" / "Sukses"
trans('message.success.created')       // "Data successfully created" / "Data berhasil dibuat"
trans('message.success.deleted')       // "Data successfully deleted" / "Data berhasil dihapus"

// With parameters (use :placeholder)
trans('message.success.bulk_deleted', ['count' => $deletedCount])
// → "5 data successfully deleted" / "5 data berhasil dihapus"

// Error messages
trans('message.error.data_not_found')        // "Data not found" / "Data tidak ditemukan"
trans('message.error.data_already_exists')   // "Data already exist" / "Data sudah tersedia"
trans('message.error.internal_server_error') // "Internal server error" / "Kesalahan server internal"
```

### 5.6 Rules for Adding New Messages

1. **ALWAYS add to BOTH `lang/en/message.php` AND `lang/id/message.php`** — never add to only one language.
2. **Use the same key** in both files — the key must be identical.
3. **Group correctly** — success messages under `'success'`, error messages under `'error'`.
4. **Key naming**: use `snake_case` descriptive keys (e.g., `'data_not_found'`, `'cost_price_greater_than_price_validation'`).
5. **Use `:placeholder` syntax** for dynamic values (e.g., `:count`, `:resource`), **NOT `%s`** for new messages (some legacy messages still use `%s` with `sprintf`).
6. **When adding new model attributes**, add the human-readable name to `validation.php` → `attributes` in BOTH languages.
7. **Do NOT hardcode messages** in controllers or services — always use `trans()`.
8. **Exception and Error Messages**: All custom exception messages thrown in services, repositories, or form requests MUST be localized using `trans()` with keys under `message.error.*` to prevent exposing hardcoded string messages to clients.

### 5.7 New Feature Message Checklist

When adding a new entity/feature, check if you need to:

- [ ] Add new entries to `lang/en/message.php` AND `lang/id/message.php`
- [ ] Add new attribute names to `lang/en/validation.php` → `attributes` AND `lang/id/validation.php` → `attributes`
- [ ] Add new validation rules if custom messages are needed

---

## 6. New Feature Checklist

Use this checklist every time you create a new entity/feature:

- [ ] **Model** (`app/Models/{Model}.php`) — `HasFactory`, `$fillable`, relations
- [ ] **Migration** (`database/migrations/`) — table schema
- [ ] **Factory** (`database/factories/{Model}Factory.php`) — faker data
- [ ] **Request DTO** (`app/Support/Models/{Model}/Get{Model}ReqModel.php`)
- [ ] **Repository Interface** (`app/Support/Interfaces/Repositories/{Model}RepositoryInterface.php`)
- [ ] **Repository** (`app/Repositories/{Model}Repository.php`)
- [ ] **Service Interface** (`app/Support/Interfaces/Services/{Model}ServiceInterface.php`)
- [ ] **Service** (`app/Services/{Model}Service.php`)
- [ ] **Permission Enum** (`app/Support/Enums/{Model}PermissionEnums.php`)
- [ ] **API Resource** (`app/Http/Resources/{Model}Resource.php`)
- [ ] **Form Requests** (`app/Http/Requests/{Model}/Store|Update|BulkDelete`)
- [ ] **Web Controller** (`app/Http/Controllers/{Model}Controller.php`)
- [ ] **API Controller** (`app/Http/Controllers/Api/Api{Model}Controller.php`)
- [ ] **Service Provider** — bindings in `AppServiceProvider::register()`
- [ ] **Routes** — web + API in `routes/web.php`
- [ ] **Messages** — add to both `lang/en/message.php` and `lang/id/message.php`
- [ ] **Validation Attributes** — add to both `lang/en/validation.php` and `lang/id/validation.php`
- [ ] **Tests** — feature tests in `tests/Feature/{Model}/`
- [ ] **Pint** — run `vendor/bin/pint --dirty --format agent`

---

## 7. Naming Conventions

| Component | Format | Example |
|---|---|---|
| Model | `PascalCase` | `Unit`, `TransactionDetail` |
| Migration | `snake_case` | `create_units_table` |
| Factory | `{Model}Factory` | `UnitFactory` |
| Repository Interface | `{Model}RepositoryInterface` | `UnitRepositoryInterface` |
| Repository | `{Model}Repository` | `UnitRepository` |
| Service Interface | `{Model}ServiceInterface` | `UnitServiceInterface` |
| Service | `{Model}Service` | `UnitService` |
| Web Controller | `{Model}Controller` | `UnitController` |
| API Controller | `Api{Model}Controller` | `ApiUnitController` |
| Form Request | `Store{Model}Request` | `StoreUnitRequest` |
| API Resource | `{Model}Resource` | `UnitResource` |
| Permission Enum | `{Model}PermissionEnums` | `UnitPermissionEnums` |
| Request DTO | `Get{Model}ReqModel` | `GetUnitReqModel` |
| Route names (API) | `api{Models}.{method}` | `apiUnits.index` |
| Permission values | `{action}-{model}` | `create-unit` |
| Message keys | `snake_case` | `data_not_found` |
| Validation attributes | `snake_case` | `cost_price` |

---

## 8. Tech Stack

- **PHP** 8.4
- **Laravel** v13
- **Database**: PostgreSQL (use `ilike` for case-insensitive search)
- **Frontend**: React 19 + Inertia.js v3 + Tailwind CSS v4
- **Testing**: Pest v4
- **Code Style**: Laravel Pint
- **Auth**: Laravel Fortify
- **Permissions**: spatie/laravel-permission (via `Role` and `Permission` models)

---

## 9. Frontend Architecture & Development Patterns

### 9.1 Directory Structure (`resources/js`)

```
resources/js/
├── actions/                  # Wayfinder auto-generated typed functions for controllers
├── components/               # Reusable UI & App components
│   ├── auth/                 # Permission guards (e.g. Can.tsx)
│   ├── ui/                   # Shadcn / Radix primitives (Button, Input, Dialog, etc.)
│   ├── app-sidebar.tsx       # Sidebar navigation
│   └── server-side-data-table-header.tsx  # Table header with sorting
├── constants/                # Global constants (e.g. PAGINATIONLIMITOPTIONDEFAULT)
├── hooks/                    # Custom React hooks
├── layouts/                  # Inertia layout components
├── lib/                      # Utilities (axios instance, formatters, helpers)
├── locales/                  # i18next JSON translation files
│   ├── en/translation.json   # English translations
│   └── id/translation.json   # Indonesian translations
├── pages/                    # Inertia page components
│   └── {feature_name}/       # Feature module directory (e.g. transaction/, product/)
│       ├── index.tsx         # Main page entry point
│       ├── columns.tsx       # TanStack Table column definitions
│       ├── data-table.tsx    # Server-Side or Client-Side DataTable component
│       └── dialog-modal/     # Feature dialogs (detail, create, edit, delete)
├── routes/                   # Wayfinder auto-generated typed route helpers
└── support/                  # Frontend types, interfaces, enums
    ├── enums/                # PermissionEnums.ts, etc.
    ├── interfaces/           # Request, Resource, and Response interfaces
    └── models/               # TypeScript entity models (transaction.ts, etc.)
```

### 9.2 Route & API Integration (Laravel Wayfinder)

Always use auto-generated Wayfinder typed route functions instead of hardcoded URLs:

```ts
import { index as apiGetTransactions } from '@/routes/apiTransactions';
import { index as transactions } from '@/routes/transactions';

// Web route for breadcrumbs
const { url } = transactions();

// API route call with query parameters
const apiUrl = apiGetTransactions({
    query: { page: 1, limit: 10, keyword: 'INV-123' }
}).url;

const res = await axiosInstance.get(apiUrl);
```

#### Generating Wayfinder Routes & Actions

Whenever new routes or controllers are added or modified, run the Wayfinder generator artisan command to regenerate typed TypeScript helper functions:

```bash
# Generate route helpers including form helper objects (.form()) - RECOMMENDED
php artisan wayfinder:generate --with-form
```

> [!IMPORTANT]
> **ALWAYS use the `--with-form` flag.** Running standard `php artisan wayfinder:generate` without this flag will wipe out the `.form()` helper functions across all route files. Since these helpers are heavily relied upon by authentication and profile settings forms, omitting this flag will cause TypeScript type checking errors in unrelated files.

**Key Points:**
- The `--with-form` flag generates `.form()` helper functions alongside `.url()`, `.get()`, `.post()`, `.put()`, `.delete()`, making it easy to integrate with Inertia forms and requests.
- Auto-generated output directories:
  - Controller actions: `resources/js/actions/`
  - Named routes: `resources/js/routes/`

### 9.3 DataTable Patterns (Client-Side vs Server-Side)

#### 9.3.1 Client-Side DataTable Pattern (Example: `resources/js/pages/unit`)

Used when fetching all records at once from the API and allowing TanStack Table to handle sorting, filtering, and pagination entirely in the browser:

1. **Data Fetching**: Fetch full array of items into React state (`allUnits`) via `axiosInstance.get(apiUrl)` on mount.
2. **TanStack Table Models**:
   - `getCoreRowModel()`
   - `getFilteredRowModel()`
   - `getSortedRowModel()`
   - `getPaginationRowModel()`
3. **State Management**: Uses TanStack Table's internal `pagination` (`pageIndex`, `pageSize`), `columnFilters`, `sorting`, `rowSelection`, and `columnVisibility`.
4. **Browser Filtering**: Filter rows instantly using `table.getColumn(columnId)?.setFilterValue(value)`.
5. **Column Header Sorting**: Standard column sorting using `column.getCanSort()` and `column.toggleSorting()`.

#### 9.3.2 Server-Side DataTable Pattern (Example: `resources/js/pages/transaction`, `resources/js/pages/product`)

Used when datasets are large and require backend-driven filtering, ordering, and pagination:

1. **State Management**: Maintain explicit state for `queryParam` (`page`, `limit`, `keyword`, `field`, `start_date`, `end_date`, `order_by`, `order`) and `pagination` (`current_page`, `last_page`, `total`, etc.).
2. **Debounced Fetch**: Debounce search keyword changes before calling API to avoid excessive backend queries.
3. **Sorting**: Use `ServerSideDataTableHeader` in column definitions to handle column sort toggling (`sortKey`, `orderBy`, `order`, `onSortChange`).
4. **Skeleton Loading**: Render skeleton rows while `processing` state is `true`.
5. **Pagination & Limit**: Provide limit options (10, 20, 50, 100) and custom page navigation buttons (first, prev, next, last).

#### 9.3.3 DataTable UI/UX Standards & Filter Characteristics

To ensure a unified user experience across all DataTables in the application, follow these layout & styling standards:

1. **Outer Container**: Wrap the entire table component in a rounded border card: `<div className="rounded-2xl border p-3">`.
2. **Top Action Bar**: Right-aligned row (`flex justify-start items-center gap-2 overflow-auto sm:justify-end lg:mt-0`) containing action buttons (`Reset Filter`, `Export`, `Bulk Delete`, `Kolom`, and `Tambah`). All action buttons use standard `<Button variant="outline">` styling for visual consistency.
3. **Filter Box Grid (`second-row`)**:
   - Container class: `<div className="second-row grid grid-cols-1 gap-2 gap-y-3 md:grid-cols-2 lg:grid-cols-3 border p-3 rounded-md">`.
   - Each filter control has an explicit `<Label className="text-xs font-medium text-muted-foreground">` above its input element.
   - Keyword search combines a column selector (`<Select>`) and query input (`<Input className="w-full">`).
4. **Active Filter Badges**:
   - When any filter is active, render active badges at the bottom of the filter box: `<div className="col-span-full flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">`.
   - Each active filter is rendered as a `<Badge variant="secondary" className="gap-1.5 py-0.5 px-2 font-normal text-xs bg-muted/50 hover:bg-muted">`.
   - Include a Close (`<X className="h-3 w-3" />`) button on each badge allowing users to remove individual filters without resetting the rest of the form.
5. **Cell Typography & Alignment**:
   - Table cells use standard body font (`text-sm text-foreground` or `<span className="whitespace-nowrap">`).
   - Avoid `text-xs text-muted-foreground` styling on primary column values (such as dates & times) to keep text legibility uniform across all columns.

### 9.4 Internationalization (i18n) & Translation Design Patterns

This application uses **`react-i18next`** and **`i18next`** for full client-side internationalization.

#### 9.4.1 Locales Directory & Mandatory JSON Structure

Translation files are located in `resources/js/locales/`:
- `resources/js/locales/id/translation.json` (Indonesian - default & fallback)
- `resources/js/locales/en/translation.json` (English)

**CRITICAL RULE FOR JSON NESTING HIERARCHY**:
All page-specific translation keys **MUST be placed INSIDE the `"page"` parent object**. Placing module keys outside `"page"` (at the root JSON level) will cause `t('page.{module}.*')` lookups in non-default languages to fail, causing a silent fallback to the default Indonesian fallback string.

```json
{
  "page": {
    "kasir": {
      "page_name": "Kasir Minimarket",
      "search_placeholder": "Scan Barcode / Ketik Kode / Nama Barang (Enter)...",
      "cart_label": "Daftar Belanja",
      "empty_cart_title": "Keranjang Masih Kosong"
    },
    "product": {
      "page_name": "Produk"
    },
    "transaction": {
      "page_name": "Transaksi"
    }
  },
  "component": {
    "sidebar": {
      "kasir_menu_label": "Kasir"
    }
  },
  "permission_label": { ... },
  "error": {
    "default": "Kesalahan sistem internal"
  }
}
```

#### 9.4.2 React Component Usage Pattern

1. **Import and invoke `useTranslation()`**:
   ```tsx
   import { useTranslation } from 'react-i18next';

   export default function ModuleComponent() {
       const { t } = useTranslation();

       return (
           <h1>{t('page.kasir.page_name', 'Kasir Minimarket')}</h1>
       );
   }
   ```

2. **Always Provide a Fallback String**:
   Always pass a descriptive Indonesian string as the 2nd argument to `t()`. This ensures the UI renders gracefully even if a key is missing.
   ```tsx
   {t('page.kasir.clear_cart_btn', 'Kosongkan')}
   ```

3. **Synchronous Inertia Layout Titles**:
   For Inertia page layout titles, use `i18next.t()` directly:
   ```ts
   import i18next from 'i18next';

   KasirIndex.layout = {
       breadcrumbs: [
           {
               title: i18next.t('page.kasir.page_name', 'Kasir Minimarket'),
               href: url,
           },
       ],
   };
   ```

4. **Numeric Format for Monetary vs Percentage Inputs**:
   When rendering discount inputs or currency fields:
   - For **Nominal Currency (Rp)** fields: Use `react-number-format` (`NumericFormat` with `thousandSeparator="."`, `decimalSeparator=","`, and `customInput={Input}`).
   - For **Percentage (%)** fields: Use standard `<Input type="number" min={0} max={100} />`.

#### 9.4.3 Key Naming Conventions

| Category | Key Pattern | Example |
| :--- | :--- | :--- |
| **Page Name** | `page.{module}.page_name` | `page.kasir.page_name` |
| **Page Controls / Buttons** | `page.{module}.{action}_btn` | `page.kasir.checkout_btn` |
| **Labels & Summaries** | `page.{module}.{field}_label` | `page.kasir.total_discount_label` |
| **DataTable Columns** | `page.{module}.data_table.columns.{col}_column_label` | `page.product.data_table.columns.name_column_label` |
| **Dialog Modals** | `page.{module}.dialog_modal.{dialog_type}.*` | `page.category.dialog_modal.create_dialog.title` |
| **Sidebar Menu** | `component.sidebar.{entity}_menu_label` | `component.sidebar.kasir_menu_label` |
| **Permissions** | `permission_label.{entity}.{action}` | `permission_label.transaction.read` |

### 9.5 Permissions & Authorization Guard

Protect UI elements and action buttons using the `<Can>` component and `PERMISSIONENUMS`:

```tsx
import { Can } from '@/components/auth/can';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';

<Can permission={PERMISSIONENUMS.TRANSACTION.DELETE}>
    <DropdownMenuItem onClick={handleDelete}>
        Hapus Data
    </DropdownMenuItem>
</Can>
```

### 9.6 Modals & Dialogs Separation

Keep page modules clean by splitting dialogs into `dialog-modal/`:
- `detail-dialog.tsx`: View entity details.
- `create-dialog.tsx`: Form modal for creating new record.
- `edit-dialog.tsx`: Form modal for editing existing record.
- `delete-dialog.tsx`: Confirmation alert dialog for deletion.
- `bulk-delete-dialog.tsx`: Confirmation alert dialog for multi-row deletion.

### 9.7 Frontend Code Quality Checklist

- [ ] Add entity model to `resources/js/support/models/{entity}.ts`
- [ ] Add query param interface to `resources/js/support/interfaces/request/{entity}.ts`
- [ ] Register permissions in `resources/js/support/enums/PermissionEnums.ts`
- [ ] Add menu item to `resources/js/components/app-sidebar.tsx`
- [ ] Add translation keys to BOTH `id/translation.json` AND `en/translation.json`
- [ ] Implement `columns.tsx`, `data-table.tsx`, and `index.tsx` inside `resources/js/pages/{entity}/`
- [ ] Run `npm run build` or `npx tsc --noEmit` to verify type safety

---

## 10. Conventions for Static Values & Constants

To maintain clean code and avoid hardcoded values across the codebase:

### 10.1 Non-multi-value Static Constants
*   **Definition**: Values that are singular or standalone settings (e.g. image upload paths, default pagination limits, special flags, empty values).
*   **Convention**: Store these values in `App\Support\Constants\Constants.php`.
*   **Rule**: Never use raw hardcoded string or numeric constants inside controller or service classes.

### 10.2 Multi-value Static Enums
*   **Definition**: Database columns, status codes, or state conditions that can have multiple distinct static values (e.g. status: `active`/`inactive`, transaction type: `sales_profit`/`disbursement`/`capital_withdrawal`, transaction direction: `in`/`out`).
*   **Convention**: Always create a dedicated backed enum file under `app/Support/Enums/`.
*   **Rule**:
    1. Enums must be string-backed (e.g. `enum ProfitWalletStatusEnums: string`).
    2. Enum file and class names must use plural naming convention (e.g. `ProfitWalletStatusEnums`, not `ProfitWalletStatus`).

---

## 11. Conventions for API Responses & Paginated Lists

To ensure consistency between the backend API responses and frontend TypeScript models:

### 11.1 API Response Formats
*   **Standard API Response**: Wrap all JSON responses using the `ResponseApi` utility.
*   **Pagination Wrapper**: For paginated lists returned from controllers, always format items using an Eloquent Resource and wrap the collection with `App\Support\Utils\PaginationResource::make($items, $paginator)`.
*   **Response Payload Structure**:
    ```php
    return ResponseApi::make(true, trans('message.success.success'), [
        'items' => $resourceCollection,
        'pagination' => $paginationMetadata,
    ]);
    ```

### 11.2 Frontend Response Model Mapping
*   **Type Safety**: Avoid using generic `any` or raw objects for paginated payloads.
*   **TypeScript Interfaces**:
    1. Define individual item types inside `resources/js/support/models/`.
    2. Import `PaginationResponse` from `@/support/interfaces/resource/resource-response`.
    3. Import `ResponseApi` from `@/support/interfaces/response/Response`.
*   **Axios Generic Types**: Type the Axios response object with the generic response wrapper, utilizing auto-generated Wayfinder route helpers for the URL:
    ```typescript
    import { index as apiGetEntities } from '@/routes/apiEntities';

    const res = await axiosInstance.get<ResponseApi<PaginationResponse<YourEntity>>>(apiGetEntities().url);
    if (res.data.success) {
        setItems(res.data.data.items);
        setPagination(res.data.data.pagination);
    }
    ```

---

## 12. Conventions for Financial Ledger Denormalization

When building ledger-style financial tables (e.g. cash flow, transaction history, profit wallet):

### 12.1 Performance Strategy
*   **Reads**: Fetching lifetime sums or current balances should be done using pre-calculated/denormalized summary columns on the parent table (e.g. `balance`, `total_inflow`, `total_outflow` in `profit_wallets` table) to achieve **O(1)** read performance.
*   **Writes**: Increment/decrement the cumulative summary columns in the same transaction block that creates the transaction log in the ledger.
*   **Pessimistic Locking**: Always wrap balance updates inside database transactions using pessimistic locks (`lockForUpdate()`) to prevent race conditions during concurrent write operations.
*   **Date Filters**: If a date filter is active, fallback to running aggregation queries (`SUM(amount)`) on the transaction ledger table for accurate filtered data.



