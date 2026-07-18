# Super POS — Design Pattern & Architecture Guide

> Dokumen ini ditujukan untuk AI Agent / Coding Assistant agar memahami arsitektur, konvensi, dan pola desain yang digunakan pada project **Super POS**.  
> **Selalu ikuti pola ini ketika membuat fitur baru.**

---

## 1. Arsitektur Utama

Project ini menggunakan **Repository-Service-Controller (RSC) Pattern** dengan dependency injection melalui Laravel Service Container.

```
Request → Route → Controller → Service → Repository → Model → Database
                      ↓              ↓            ↓
                 FormRequest    Interface     Interface
                 Resource       CheckException
                 ResponseApi
```

### Alur Data (Request → Response)

1. **Route** (`routes/web.php`) menerima request dan meneruskan ke Controller.
2. **Controller** menerima request, memvalidasi via **FormRequest**, memanggil **Service**.
3. **Service** berisi business logic, memanggil **Repository** untuk akses data.
4. **Repository** berinteraksi langsung dengan **Model** (Eloquent) untuk query database.
5. Response dikembalikan via **API Resource** dan dibungkus oleh **ResponseApi** utility.

### Prinsip Penting

- **Controller** TIDAK boleh mengakses Repository secara langsung. Selalu melalui Service.
- **Service** TIDAK boleh mengakses Model secara langsung. Selalu melalui Repository.
- **Repository** adalah satu-satunya layer yang berinteraksi dengan Eloquent Model.
- Semua dependency di-inject melalui **Interface**, bukan class konkret.
- Semua binding Interface → Implementation didaftarkan di `AppServiceProvider`.

---

## 2. Struktur Direktori

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
│   │   └── {NamaModel}/                  # Satu folder per model
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
│   │   └── {NamaModel}/
│   └── Utils/
│       ├── CheckException.php
│       └── ResponseApi.php
├── Providers/
│   └── AppServiceProvider.php            # Binding Interface → Implementation
database/
├── factories/
│   ├── CategoryFactory.php
│   └── ...
├── migrations/
routes/
│   └── web.php                           # Semua route (web + api prefix)
tests/
├── Feature/
│   ├── Category/
│   │   └── CategoryTest.php
│   └── {NamaModel}/
└── Pest.php
```

---

## 3. Panduan Membuat Fitur Baru (Step-by-Step)

Contoh: membuat fitur CRUD untuk entitas **"Unit"**.

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

    // overide default iso datetime format from model
    protected function serializeDate(DateTimeInterface $date): int
    {
        return $date->getTimestamp();
    }
}
```

**Konvensi:**
- Gunakan `HasFactory` trait.
- Definisikan `$fillable` secara eksplisit.
- Jika tabel menggunakan unix timestamp, set `$dateFormat = 'U'` dan override `serializeDate()`.

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

**Konvensi:**
- Beberapa tabel menggunakan `$table->timestamps()` standar, beberapa menggunakan `unsignedBigInteger` (unix). Ikuti model terkait.

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

**Konvensi:**
- Selalu buat factory bersamaan dengan model baru.
- Gunakan `fake()` helper untuk generate data.
- Untuk relasi foreign key, gunakan `RelatedModel::factory()` bukan `fake()->numberBetween()`.

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

**Konvensi:**
- Namespace: `App\Support\Models\{NamaModel}`
- Nama class: `Get{NamaModel}ReqModel`
- Properti nullable (`?type`), diisi dari `$request->query()`.
- Selalu sertakan minimal: `page`, `limit`, `order_by`, `order`.

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

**Konvensi:**
- Namespace: `App\Support\Interfaces\Repositories`
- Nama: `{NamaModel}RepositoryInterface`
- Method `update()` dan `delete()` menerima instance Model, bukan ID.
- Method `getAllByIndex()` menerima `Get{NamaModel}ReqModel`.
- Setiap method memiliki PHPDoc block.

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

**Konvensi:**
- Implements interface terkait.
- `getAllByIndex()`: default order `id desc`, gunakan `when()` untuk filter conditional.
- Jika `limit` null → `get()`, jika ada → `paginate()->onEachSide(1)`.
- Pencarian teks menggunakan `ilike` (PostgreSQL case-insensitive).

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
    public function update(int $id, array $data): ?Unit;  // Menerima ID, bukan Model
    public function delete(int $id): bool;                  // Menerima ID, bukan Model
    public function bulkDelete(array $ids): int;
}
```

**Perbedaan penting vs Repository Interface:**
- Service `update()` dan `delete()` menerima **ID** (int), bukan instance Model.
- Service menambahkan method `bulkDelete()` sebagai alias dari `deleteMany()`.
- Service TIDAK memiliki method `insert()`, `getByName()`, `getByNameExceptID()` (itu internal repository).

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
            // Cek duplikasi nama
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
            // Cari data, throw 404 jika tidak ada
            $unit = $this->unitRepository->getById($id);
            if (! isset($unit)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            // Cek duplikasi nama (kecuali ID sendiri)
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

**Konvensi:**
- Inject Repository via constructor property promotion: `__construct(protected UnitRepositoryInterface $unitRepository) {}`
- **SEMUA** method dibungkus `try/catch` dengan `CheckException::Check($th)`.
- Business logic (duplikasi cek, not found) ada di Service, BUKAN di Repository atau Controller.
- Gunakan `trans()` untuk pesan error.
- HTTP status codes: `422` (duplikat), `404` (not found), `500` (server error).

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

**Konvensi:**
- Backed enum (`string`).
- Format case: `{ACTION}_{MODEL}` → `CREATE_UNIT`.
- Format value: `{action}-{model}` → `'create-unit'`.
- Selalu 4 permission: CREATE, READ, UPDATE, DELETE.

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

**Konvensi:**
- Untuk model sederhana, `parent::toArray()` cukup.
- Untuk model dengan relasi, buat mapping eksplisit (lihat `ProductResource` sebagai contoh).

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

**Konvensi:**
- Satu folder per model: `app/Http/Requests/{NamaModel}/`
- Minimal 3 file: `Store{Model}Request`, `Update{Model}Request`, `BulkDelete{Model}Request`.
- `authorize()` return `true` (otorisasi ditangani middleware permission).
- `Store` biasanya punya `Rule::unique()`, `Update` tidak (ditangani di Service).

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
        return inertia('{model}/index');  // contoh: 'unit/index'
    }
}
```

**Konvensi:**
- Implements `HasMiddleware`.
- Hanya method `index()` untuk merender halaman Inertia.
- Inject Service via constructor.
- Permission middleware menggunakan Enum.

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

**Konvensi:**
- Prefix class: `Api{NamaModel}Controller`.
- SEMUA method dibungkus `try/catch`.
- Success response: `ResponseApi::make(true, message, data, httpCode)`.
- Error response: `ResponseApi::make(false, $th->getMessage(), null, $th->getCode())`.
- `store()` return `Response::HTTP_CREATED` (201).
- `destroy()` dan `bulkDelete()` return `Response::HTTP_OK` (200).
- Gunakan `$request->validated()` untuk data tervalidasi.

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

**Konvensi:**
- Bind **Repository Interface → Repository Implementation**.
- Bind **Service Interface → Service Implementation**.
- Berikan komentar `// {NamaModel} service` di atasnya.
- Import semua class di bagian `use` statement.

---

### Step 15: Route Registration (`routes/web.php`)

```php
// Di dalam Route::middleware(['auth', 'verified'])->group()

// Web route (Inertia page)
Route::resource('units', UnitController::class)->only('index');

// Di dalam Route::group(['prefix' => 'api'])

// API CRUD resource
Route::resource('unit', ApiUnitController::class)
    ->names('apiUnits')
    ->only(['index', 'store', 'show', 'update', 'destroy']);

// Custom routes (bulk delete, dll)
Route::group(['prefix' => 'unit'], function () {
    Route::post('/bulk-delete', [ApiUnitController::class, 'bulkDelete'])
        ->name('apiUnits.bulkDelete');
});
```

**Konvensi:**
- Web route: plural (`units`), hanya `index`.
- API resource: singular atau sesuai konteks, dengan `->names('api{Models}')`.
- Custom endpoint (bulk-delete, dll) dalam group terpisah dengan prefix yang sama.
- Nama route: `api{Models}.{method}` → `apiUnits.bulkDelete`.

---

### Step 16: Testing (`tests/Feature/{NamaModel}/`)

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

**Konvensi:**
- Framework: **Pest** (bukan PHPUnit).
- `uses(RefreshDatabase::class)` di setiap file test.
- Pest.php sudah mengkonfigurasi `RefreshDatabase` global untuk folder `Feature`, tetapi beberapa file test tetap mendeklarasikannya secara eksplisit.
- Gunakan `test()` atau `it()` syntax.
- Gunakan `->actingAs()` untuk autentikasi.
- Gunakan `->getJson()`, `->postJson()`, `->putJson()`, `->deleteJson()`.
- Assertion: `->assertOk()`, `->assertCreated()`, `->assertUnprocessable()`, `->assertNotFound()`.
- Factory untuk membuat data test.

---

## 4. Utility Classes

### `ResponseApi` — Standard JSON Response

```php
ResponseApi::make(bool $isSuccess, string $message, mixed $data = null, ?int $httpCode = 200)
```

Format response:
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

- Log error ke Laravel Log.
- Jika code bukan HTTP valid (100-599), return generic 500 error.
- Jika code valid, return exception aslinya.

---

## 5. Checklist Membuat Fitur Baru

Gunakan checklist ini setiap kali membuat entitas/fitur baru:

- [ ] **Model** (`app/Models/{Model}.php`) — `HasFactory`, `$fillable`, relasi
- [ ] **Migration** (`database/migrations/`) — schema tabel
- [ ] **Factory** (`database/factories/{Model}Factory.php`) — data faker
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
- [ ] **Service Provider** — binding di `AppServiceProvider::register()`
- [ ] **Routes** — web + API di `routes/web.php`
- [ ] **Tests** — feature tests di `tests/Feature/{Model}/`
- [ ] **Pint** — jalankan `vendor/bin/pint --dirty --format agent`

---

## 6. Konvensi Penamaan

| Komponen | Format | Contoh |
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

---

## 7. Tech Stack

- **PHP** 8.4
- **Laravel** v13
- **Database**: PostgreSQL (gunakan `ilike` untuk case-insensitive search)
- **Frontend**: React 19 + Inertia.js v3 + Tailwind CSS v4
- **Testing**: Pest v4
- **Code Style**: Laravel Pint
- **Auth**: Laravel Fortify
- **Permissions**: spatie/laravel-permission (via `Role` dan `Permission` models)
