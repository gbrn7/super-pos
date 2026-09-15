# Product From Master Product Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify `ProductFromMasterProductSeeder` to populate the `products` table from `master_products` in chunks of 250 records with category/unit fallback, stock randomization (10-50), and duplicate barcode skipping.

**Architecture:** A dedicated Laravel database seeder using `MasterProduct::query()->orderBy('id')->chunkById(250)` with in-memory caching for category and unit IDs (`firstOrCreate`) to avoid N+1 queries, transforming records into products with standard SKU formatting, and bulk inserting via `Product::insertOrIgnore()`.

**Tech Stack:** PHP 8.4, Laravel 12, Pest 3, MySQL/SQLite, Pint.

## Global Constraints
- Target seeder: `database/seeders/ProductFromMasterProductSeeder.php`
- Chunk size: exactly 250 records per chunk
- Category fallback: `"Umum"`, Unit fallback: `"Pcs"`
- Stock default: `rand(10, 50)`
- Status defaults: `is_active = true`, `is_unlimited = false`, `sold_quantity = 0`
- Barcode deduplication: existing barcodes in `products` must not trigger duplicate errors (`insertOrIgnore`)
- Follow Laravel Pint formatting

---

### Task 1: Create Feature Test for ProductFromMasterProductSeeder

**Files:**
- Create: `tests/Feature/ProductFromMasterProductSeederTest.php`

**Interfaces:**
- Consumes: `MasterProduct` model, `Product` model, `Category` model, `Unit` model
- Produces: Pest test verifying seeder chunking, category/unit creation, stock ranges, and deduplication

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\Product;
use App\Models\Unit;
use Database\Seeders\ProductFromMasterProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it seeds products from master products in chunks of 250 with fallbacks and random stock', function () {
    // Create 260 MasterProduct records to verify chunking of 250
    $masterProducts = [];
    $now = now();

    for ($i = 1; $i <= 260; $i++) {
        $masterProducts[] = [
            'name' => "Master Product {$i}",
            'category_name' => $i % 2 === 0 ? 'Minuman' : null,
            'unit_name' => $i % 2 === 0 ? 'Botol' : null,
            'barcode' => "8991234567{$i}",
            'desc' => "Desc for product {$i}",
            'price' => 15000,
            'cost_price' => 10000,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    MasterProduct::insert($masterProducts);

    $this->seed(ProductFromMasterProductSeeder::class);

    expect(Product::count())->toBe(260);

    // Verify category and unit fallbacks
    $umumCategory = Category::where('name', 'Umum')->first();
    $pcsUnit = Unit::where('name', 'Pcs')->first();
    $minumanCategory = Category::where('name', 'Minuman')->first();
    $botolUnit = Unit::where('name', 'Botol')->first();

    expect($umumCategory)->not->toBeNull()
        ->and($pcsUnit)->not->toBeNull()
        ->and($minumanCategory)->not->toBeNull()
        ->and($botolUnit)->not->toBeNull();

    // Verify sample product values
    $firstProduct = Product::where('barcode', '89912345671')->first();
    expect($firstProduct)->not->toBeNull()
        ->and($firstProduct->category_id)->toBe($umumCategory->id)
        ->and($firstProduct->unit_id)->toBe($pcsUnit->id)
        ->and($firstProduct->stock)->toBeGreaterThanOrEqual(10)
        ->and($firstProduct->stock)->toBeLessThanOrEqual(50)
        ->and($firstProduct->is_active)->toBeTrue()
        ->and($firstProduct->is_unlimited)->toBeFalse()
        ->and($firstProduct->sold_quantity)->toBe(0)
        ->and($firstProduct->price)->toEqual(15000)
        ->and($firstProduct->cost_price)->toEqual(10000)
        ->and($firstProduct->sku)->not->toBeEmpty();
});

test('it handles duplicate barcodes gracefully without error', function () {
    $category = Category::create(['name' => 'Sembako']);
    $unit = Unit::create(['name' => 'Kg']);

    Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Existing Product',
        'sku' => 'EXISTING-12345678',
        'barcode' => '8999999999001',
        'stock' => 10,
        'price' => 20000,
        'cost_price' => 15000,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    MasterProduct::create([
        'name' => 'Duplicate Barcode Product',
        'category_name' => 'Sembako',
        'unit_name' => 'Kg',
        'barcode' => '8999999999001',
        'price' => 20000,
        'cost_price' => 15000,
    ]);

    $this->seed(ProductFromMasterProductSeeder::class);

    // Product count should remain 1
    expect(Product::where('barcode', '8999999999001')->count())->toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/ProductFromMasterProductSeederTest.php`
Expected: FAIL because `Database\Seeders\ProductFromMasterProductSeeder` does not exist yet.

- [ ] **Step 3: Commit the test**

```bash
git add tests/Feature/ProductFromMasterProductSeederTest.php
git commit -m "test: add feature test for ProductFromMasterProductSeeder"
```

---

### Task 2: Implement ProductFromMasterProductSeeder

**Files:**
- Create: `database/seeders/ProductFromMasterProductSeeder.php`

**Interfaces:**
- Consumes: `MasterProduct`, `Product`, `Category`, `Unit`, `BarcodeGenerator`
- Produces: `Database\Seeders\ProductFromMasterProductSeeder` class

- [ ] **Step 1: Write implementation for ProductFromMasterProductSeeder**

```php
<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\Product;
use App\Models\Unit;
use App\Support\Utils\BarcodeGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductFromMasterProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // In-memory cache for category and unit name -> id mappings
        $categoryCache = Category::pluck('id', 'name')->toArray();
        $unitCache = Unit::pluck('id', 'name')->toArray();

        // Track barcodes seen to avoid in-batch collisions
        $existingBarcodes = Product::whereNotNull('barcode')->pluck('barcode')->flip()->toArray();

        MasterProduct::query()
            ->orderBy('id')
            ->chunkById(250, function ($masterProducts) use (&$categoryCache, &$unitCache, &$existingBarcodes) {
                $productsToInsert = [];
                $now = now();

                foreach ($masterProducts as $master) {
                    $barcode = filled($master->barcode) ? trim((string) $master->barcode) : null;

                    // If master product has a barcode and it already exists, skip it
                    if ($barcode !== null && isset($existingBarcodes[$barcode])) {
                        continue;
                    }

                    // Generate a new barcode if null
                    if ($barcode === null) {
                        do {
                            $barcode = BarcodeGenerator::generate();
                        } while (isset($existingBarcodes[$barcode]));
                    }

                    $existingBarcodes[$barcode] = true;

                    // Resolve category
                    $catName = filled($master->category_name) ? trim((string) $master->category_name) : 'Umum';
                    if (! isset($categoryCache[$catName])) {
                        $category = Category::firstOrCreate(['name' => $catName]);
                        $categoryCache[$catName] = $category->id;
                    }
                    $categoryId = $categoryCache[$catName];

                    // Resolve unit
                    $unitName = filled($master->unit_name) ? trim((string) $master->unit_name) : 'Pcs';
                    if (! isset($unitCache[$unitName])) {
                        $unit = Unit::firstOrCreate(['name' => $unitName]);
                        $unitCache[$unitName] = $unit->id;
                    }
                    $unitId = $unitCache[$unitName];

                    // Generate SKU
                    $prefix = Str::of($master->name)
                        ->headline()
                        ->replaceMatches('/[^A-Z]/', '')
                        ->toString();

                    if (empty($prefix)) {
                        $prefix = 'PRD';
                    }

                    $sku = $prefix.'-'.strtoupper(Str::random(8));

                    $productsToInsert[] = [
                        'category_id' => $categoryId,
                        'unit_id' => $unitId,
                        'name' => $master->name,
                        'sku' => $sku,
                        'barcode' => $barcode,
                        'is_active' => true,
                        'is_unlimited' => false,
                        'desc' => $master->desc,
                        'stock' => rand(10, 50),
                        'sold_quantity' => 0,
                        'image' => null,
                        'price' => $master->price,
                        'cost_price' => $master->cost_price,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (! empty($productsToInsert)) {
                    Product::insertOrIgnore($productsToInsert);
                }
            });
    }
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `php artisan test --compact tests/Feature/ProductFromMasterProductSeederTest.php`
Expected: PASS with 2 passed tests.

- [ ] **Step 3: Run Pint formatter**

Run: `vendor/bin/pint --format agent`

- [ ] **Step 4: Commit the implementation**

```bash
git add database/seeders/ProductFromMasterProductSeeder.php
git commit -m "feat: implement ProductFromMasterProductSeeder with chunk 250"
```

---

### Task 3: Full Verification

**Files:**
- Verify: `database/seeders/ProductFromMasterProductSeeder.php`
- Verify: `tests/Feature/ProductFromMasterProductSeederTest.php`

- [ ] **Step 1: Run complete test suite or compact relevant tests**

Run: `php artisan test --compact --filter=ProductFromMasterProductSeederTest`
Expected: All tests pass.

- [ ] **Step 2: Dry-run seeder via artisan command in tinker to verify execution**

Run: `php artisan db:seed --class=ProductFromMasterProductSeeder` or test directly in tinker.
Expected: Executes without error.
