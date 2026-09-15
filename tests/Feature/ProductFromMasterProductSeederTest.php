<?php

use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\Product;
use App\Models\Unit;
use Database\Seeders\CategorySeeder;
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
        ->and((float) $firstProduct->price)->toEqual(15000.0)
        ->and((float) $firstProduct->cost_price)->toEqual(10000.0)
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

test('category seeder includes the Umum category', function () {
    $this->seed(CategorySeeder::class);

    $umum = Category::where('name', 'Umum')->first();
    expect($umum)->not->toBeNull()
        ->and($umum->desc)->toBe('Kategori umum untuk produk lainnya.');
});
