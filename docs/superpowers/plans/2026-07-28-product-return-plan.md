# Product Return & Partial Refund Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul retur barang parsial & refund di aplikasi POS (Laravel + Inertia React) yang mengembalikan stok barang ke inventaris serta memotong saldo dompet toko secara otomatis.

**Architecture:** Membuat migration, Eloquent Models (`Return`, `ReturnDetail`), Service Layer (`ReturnService`) untuk penanganan transaksi atomic, Controller (`ReturnController`), serta UI React di Inertia untuk memproses dan melihat riwayat retur.

**Tech Stack:** PHP 8.4, Laravel 12, Inertia.js v3, React 19, Tailwind CSS v4, Pest PHP v4.

## Global Constraints
- Laravel 13 / PHP 8.4 compatibility
- Inertia v3 dengan React 19
- Menjaga integritas data dengan `DB::transaction`
- TDD dengan Pest PHP

---

### Task 1: Migration & Models (`Return`, `ReturnDetail`)

**Files:**
- Create: `database/migrations/2026_07_28_000001_create_returns_table.php`
- Create: `database/migrations/2026_07_28_000002_create_return_details_table.php`
- Create: `app/Models/ReturnModel.php`
- Create: `app/Models/ReturnDetail.php`
- Modify: `app/Models/Transaction.php`
- Modify: `app/Models/Product.php`
- Test: `tests/Unit/ReturnModelTest.php`

**Interfaces:**
- Consumes: `Transaction`, `Product`, `User` models
- Produces: `ReturnModel`, `ReturnDetail` models and Eloquent relationships

- [ ] **Step 1: Write the failing unit test for Models & Relationships**

Create `tests/Unit/ReturnModelTest.php`:
```php
<?php

use App\Models\ReturnModel;
use App\Models\ReturnDetail;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\User;

test('return model has correct relationships', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->create();
    $product = Product::factory()->create();

    $return = ReturnModel::create([
        'return_number' => 'RET-20260728-0001',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 50000,
        'reason' => 'Barang salah warna',
    ]);

    $returnDetail = ReturnDetail::create([
        'return_id' => $return->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'price_per_unit' => 25000,
        'subtotal' => 50000,
    ]);

    expect($return->transaction->id)->toBe($transaction->id);
    expect($return->user->id)->toBe($user->id);
    expect($return->details)->toHaveCount(1);
    expect($return->details->first()->product->id)->toBe($product->id);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Unit/ReturnModelTest.php`
Expected: FAIL with missing class or table not found errors.

- [ ] **Step 3: Create Migrations**

Create `database/migrations/2026_07_28_000001_create_returns_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_refund_amount', 15, 2);
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
```

Create `database/migrations/2026_07_28_000002_create_return_details_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('returns')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->decimal('price_per_unit', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_details');
    }
};
```

- [ ] **Step 4: Create Eloquent Models**

Create `app/Models/ReturnModel.php` (Catatan: Menggunakan `ReturnModel` untuk menghindari keyword PHP `return`):
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReturnModel extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $fillable = [
        'return_number',
        'transaction_id',
        'user_id',
        'total_refund_amount',
        'reason',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(ReturnDetail::class, 'return_id');
    }
}
```

Create `app/Models/ReturnDetail.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'return_id',
        'product_id',
        'quantity',
        'price_per_unit',
        'subtotal',
    ];

    public function returnModel(): BelongsTo
    {
        return $this->belongsTo(ReturnModel::class, 'return_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
```

Modify `app/Models/Transaction.php` to add returns relationship:
```php
public function returns(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(ReturnModel::class);
}
```

- [ ] **Step 5: Run tests to verify it passes**

Run: `php artisan test --compact tests/Unit/ReturnModelTest.php`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add database/migrations/ app/Models/ tests/Unit/ReturnModelTest.php
git commit -m "feat: add Return and ReturnDetail migrations and models"
```

---

### Task 2: Service Layer & Business Logic (`ReturnService`)

**Files:**
- Create: `app/Services/ReturnService.php`
- Test: `tests/Feature/ReturnServiceTest.php`

**Interfaces:**
- Consumes: `Transaction`, `Product`, `ReturnModel`, `ReturnDetail`, `CapitalWallet`
- Produces: `ReturnService::processReturn(Transaction $transaction, array $items, string $reason, User $user): ReturnModel`

- [ ] **Step 1: Write failing Feature test for ReturnService**

Create `tests/Feature/ReturnServiceTest.php`:
```php
<?php

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\User;
use App\Services\ReturnService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('return service processes partial return and updates product stock correctly', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 10]);

    $transaction = Transaction::factory()->create();
    TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'quantity' => 5,
        'price_per_unit' => 20000,
        'subtotal' => 100000,
    ]);

    $service = new ReturnService();
    $return = $service->processReturn(
        transaction: $transaction,
        items: [
            ['product_id' => $product->id, 'quantity' => 2]
        ],
        reason: 'Customer tukar ukuran',
        user: $user
    );

    expect($return)->not->toBeNull();
    expect($return->total_refund_amount)->toEqual(40000);
    expect($product->fresh()->stock)->toBe(12); // Initial 10 + 2 returned
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/ReturnServiceTest.php`
Expected: FAIL with `Class "App\Services\ReturnService" not found`.

- [ ] **Step 3: Implement `ReturnService`**

Create `app/Services/ReturnService.php`:
```php
<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ReturnDetail;
use App\Models\ReturnModel;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ReturnService
{
    public function processReturn(Transaction $transaction, array $items, ?string $reason, User $user): ReturnModel
    {
        return DB::transaction(function () use ($transaction, $items, $reason, $user) {
            $totalRefund = 0;
            $returnDetailsData = [];

            // Load transaction details
            $transaction->load('details');
            $existingReturns = ReturnModel::where('transaction_id', $transaction->id)->with('details')->get();

            foreach ($items as $item) {
                $productId = $item['product_id'];
                $returnQty = (int) $item['quantity'];

                if ($returnQty <= 0) {
                    continue;
                }

                $txDetail = $transaction->details->where('product_id', $productId)->first();
                if (! $txDetail) {
                    throw new InvalidArgumentException("Product ID {$productId} is not in transaction.");
                }

                // Calculate already returned qty
                $alreadyReturnedQty = $existingReturns->flatMap->details
                    ->where('product_id', $productId)
                    ->sum('quantity');

                $maxReturnable = $txDetail->quantity - $alreadyReturnedQty;

                if ($returnQty > $maxReturnable) {
                    throw new InvalidArgumentException("Return quantity ({$returnQty}) exceeds maximum returnable quantity ({$maxReturnable}).");
                }

                $subtotal = $returnQty * $txDetail->price_per_unit;
                $totalRefund += $subtotal;

                $returnDetailsData[] = [
                    'product_id' => $productId,
                    'quantity' => $returnQty,
                    'price_per_unit' => $txDetail->price_per_unit,
                    'subtotal' => $subtotal,
                ];
            }

            if (empty($returnDetailsData)) {
                throw new InvalidArgumentException("No valid items to return.");
            }

            $returnModel = ReturnModel::create([
                'return_number' => 'RET-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'total_refund_amount' => $totalRefund,
                'reason' => $reason,
            ]);

            foreach ($returnDetailsData as $detail) {
                ReturnDetail::create([
                    'return_id' => $returnModel->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'price_per_unit' => $detail['price_per_unit'],
                    'subtotal' => $detail['subtotal'],
                ]);

                // Restore Product Stock
                Product::where('id', $detail['product_id'])->increment('stock', $detail['quantity']);
            }

            return $returnModel;
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact tests/Feature/ReturnServiceTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Services/ReturnService.php tests/Feature/ReturnServiceTest.php
git commit -m "feat: implement ReturnService logic with stock restoration"
```

---

### Task 3: Controller & API Endpoints

**Files:**
- Create: `app/Http/Controllers/ReturnController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/ReturnControllerTest.php`

**Interfaces:**
- Consumes: `ReturnService`, Inertia Response
- Produces: `POST /returns` (Store return), `GET /returns` (List returns)

- [ ] **Step 1: Write failing Feature test for ReturnController**

Create `tests/Feature/ReturnControllerTest.php`:
```php
<?php

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can store return transaction', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 10]);

    $transaction = Transaction::factory()->create();
    TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'price_per_unit' => 15000,
        'subtotal' => 30000,
    ]);

    $response = $this->actingAs($user)->post(route('returns.store'), [
        'transaction_id' => $transaction->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1]
        ],
        'reason' => 'Barang cacat ringan',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('returns', [
        'transaction_id' => $transaction->id,
        'total_refund_amount' => 15000,
    ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/ReturnControllerTest.php`
Expected: FAIL with `Route [returns.store] not defined`.

- [ ] **Step 3: Create Controller & Register Route**

Create `app/Http/Controllers/ReturnController.php`:
```php
<?php

namespace App\Http/Controllers;

use App\Models\ReturnModel;
use App\Models\Transaction;
use App\Services\ReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(): Response
    {
        $returns = ReturnModel::with(['transaction', 'user', 'details.product'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Returns/Index', [
            'returns' => $returns,
        ]);
    }

    public function store(Request $request, ReturnService $returnService)
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'exists:transactions,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $transaction = Transaction::findOrFail($validated['transaction_id']);

        $returnService->processReturn(
            transaction: $transaction,
            items: $validated['items'],
            reason: $validated['reason'] ?? null,
            user: $request->user()
        );

        return redirect()->back()->with('success', 'Retur barang berhasil diproses.');
    }
}
```

Modify `routes/web.php` to include return routes:
```php
use App\Http\Controllers\ReturnController;

Route::middleware(['auth'])->group(function () {
    Route::get('/returns', [ReturnController::class, 'index'])->name('returns.index');
    Route::post('/returns', [ReturnController::class, 'store'])->name('returns.store');
});
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `php artisan test --compact tests/Feature/ReturnControllerTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ReturnController.php routes/web.php tests/Feature/ReturnControllerTest.php
git commit -m "feat: add ReturnController and routes"
```

---

### Task 4: UI React Inertia (Modal Retur & Page Index)

**Files:**
- Create: `resources/js/Pages/Returns/Index.tsx`
- Create: `resources/js/Components/ReturnModal.tsx`
- Modify: `resources/js/Pages/Transactions/Index.tsx` (Add Return trigger button)

- [ ] **Step 1: Create Return Modal Component**

Create `resources/js/Components/ReturnModal.tsx`:
```tsx
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
}

interface TransactionDetail {
    id: number;
    product_id: number;
    product: Product;
    quantity: number;
    price_per_unit: number;
}

interface Transaction {
    id: number;
    invoice_number: string;
    details: TransactionDetail[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function ReturnModal({ isOpen, onClose, transaction }: Props) {
    if (!isOpen || !transaction) return null;

    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
    const [reason, setReason] = useState('');

    const { post, processing, errors } = useForm();

    const handleQtyChange = (productId: number, qty: number, max: number) => {
        const validQty = Math.max(0, Math.min(qty, max));
        setQuantities(prev => ({ ...prev, [productId]: validQty }));
    };

    const calculateTotalRefund = () => {
        return transaction.details.reduce((sum, detail) => {
            const qty = quantities[detail.product_id] || 0;
            return sum + (qty * detail.price_per_unit);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const items = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, quantity]) => ({
                product_id: Number(productId),
                quantity,
            }));

        if (items.length === 0) return;

        post('/returns', {
            data: {
                transaction_id: transaction.id,
                items,
                reason,
            },
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Retur Barang #{transaction.invoice_number}
                </h3>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-3">
                        {transaction.details.map((detail) => (
                            <div key={detail.id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{detail.product.name}</p>
                                    <p className="text-xs text-gray-500">Rp {detail.price_per_unit.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max={detail.quantity}
                                        value={quantities[detail.product_id] || 0}
                                        onChange={(e) => handleQtyChange(detail.product_id, parseInt(e.target.value) || 0, detail.quantity)}
                                        className="w-16 rounded border px-2 py-1 text-center text-sm dark:bg-gray-700"
                                    />
                                    <span className="text-xs text-gray-500">/ {detail.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Alasan Retur</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700"
                            rows={2}
                            placeholder="Catatan alasan..."
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-semibold">Total Refund:</span>
                        <span className="text-lg font-bold text-emerald-600">Rp {calculateTotalRefund().toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-200 text-gray-700">Batal</button>
                        <button type="submit" disabled={processing || calculateTotalRefund() === 0} className="px-4 py-2 text-sm rounded bg-rose-600 text-white font-medium disabled:opacity-50">Proses Retur</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Create Returns Index Page**

Create `resources/js/Pages/Returns/Index.tsx`:
```tsx
import React from 'react';
import { Head } from '@inertiajs/react';

interface ReturnDetail {
    id: number;
    product: { name: string };
    quantity: number;
    price_per_unit: number;
    subtotal: number;
}

interface ReturnItem {
    id: number;
    return_number: string;
    transaction: { invoice_number: string };
    user: { name: string };
    total_refund_amount: number;
    reason: string;
    created_at: string;
    details: ReturnDetail[];
}

export default function Index({ returns }: { returns: { data: ReturnItem[] } }) {
    return (
        <div className="p-6">
            <Head title="Riwayat Retur Barang" />
            <h1 className="text-2xl font-bold mb-6">Riwayat Retur Barang</h1>

            <div className="bg-white rounded-xl shadow overflow-hidden dark:bg-gray-800">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">No. Retur</th>
                            <th className="px-6 py-3">No. Struk</th>
                            <th className="px-6 py-3">Kasir</th>
                            <th className="px-6 py-3">Total Refund</th>
                            <th className="px-6 py-3">Alasan</th>
                            <th className="px-6 py-3">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.data.map((item) => (
                            <tr key={item.id} className="border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-semibold">{item.return_number}</td>
                                <td className="px-6 py-4">{item.transaction?.invoice_number}</td>
                                <td className="px-6 py-4">{item.user?.name}</td>
                                <td className="px-6 py-4 font-bold text-rose-600">Rp {Number(item.total_refund_amount).toLocaleString()}</td>
                                <td className="px-6 py-4">{item.reason || '-'}</td>
                                <td className="px-6 py-4">{new Date(item.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Run Pint Code Formatter**

Run: `vendor/bin/pint --format agent`

- [ ] **Step 4: Commit UI components**

```bash
git add resources/js/Components/ReturnModal.tsx resources/js/Pages/Returns/Index.tsx
git commit -m "feat: add ReturnModal and Returns/Index React components"
```
