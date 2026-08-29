<?php

use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\Unit;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it updates master product when product is created with matching barcode', function () {
    $category = Category::factory()->create(['name' => 'Minuman']);
    $unit = Unit::factory()->create(['name' => 'PCS']);

    $masterProduct = MasterProduct::create([
        'name' => 'Teh Botol',
        'barcode' => '123456789',
        'cost_price' => 2000,
        'price' => 3000,
        'category_name' => 'Lama',
        'unit_name' => 'Lama',
    ]);

    $service = app(ProductService::class);

    $product = $service->create([
        'name' => 'Teh Botol Sosro',
        'barcode' => '123456789',
        'cost_price' => 2500,
        'price' => 4000,
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 10,
    ]);

    expect($product)->not->toBeNull();

    $masterProduct->refresh();

    expect((float) $masterProduct->cost_price)->toEqual(2500.0)
        ->and((float) $masterProduct->price)->toEqual(4000.0)
        ->and($masterProduct->category_name)->toBe('Minuman')
        ->and($masterProduct->unit_name)->toBe('PCS');
});

test('it creates master product when product is created with new barcode', function () {
    $category = Category::factory()->create(['name' => 'Makanan']);
    $unit = Unit::factory()->create(['name' => 'BKS']);

    $service = app(ProductService::class);

    $product = $service->create([
        'name' => 'Mie Goreng',
        'barcode' => '987654321',
        'cost_price' => 2500,
        'price' => 3500,
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 20,
    ]);

    expect($product)->not->toBeNull();

    $masterProduct = MasterProduct::where('barcode', '987654321')->first();

    expect($masterProduct)->not->toBeNull()
        ->and($masterProduct->name)->toBe('Mie Goreng')
        ->and((float) $masterProduct->cost_price)->toEqual(2500.0)
        ->and((float) $masterProduct->price)->toEqual(3500.0)
        ->and($masterProduct->category_name)->toBe('Makanan')
        ->and($masterProduct->unit_name)->toBe('BKS');
});

test('it updates master product when product is updated', function () {
    $categoryOld = Category::factory()->create(['name' => 'Minuman']);
    $unitOld = Unit::factory()->create(['name' => 'BOTOL']);

    $categoryNew = Category::factory()->create(['name' => 'Snack']);
    $unitNew = Unit::factory()->create(['name' => 'PACK']);

    $masterProduct = MasterProduct::create([
        'name' => 'Kopi Kapal Api',
        'barcode' => '55555',
        'cost_price' => 1000,
        'price' => 1500,
        'category_name' => 'Minuman',
        'unit_name' => 'BOTOL',
    ]);

    $service = app(ProductService::class);

    $product = $service->create([
        'name' => 'Kopi Kapal Api',
        'barcode' => '55555',
        'cost_price' => 1000,
        'price' => 1500,
        'category_id' => $categoryOld->id,
        'unit_id' => $unitOld->id,
        'stock' => 50,
    ]);

    $service->update($product->id, [
        'name' => 'Kopi Kapal Api Special',
        'barcode' => '55555',
        'cost_price' => 1200,
        'price' => 2000,
        'category_id' => $categoryNew->id,
        'unit_id' => $unitNew->id,
    ]);

    $masterProduct->refresh();

    expect((float) $masterProduct->cost_price)->toEqual(1200.0)
        ->and((float) $masterProduct->price)->toEqual(2000.0)
        ->and($masterProduct->category_name)->toBe('Snack')
        ->and($masterProduct->unit_name)->toBe('PACK');
});

test('it generates a unique barcode when creating a product without barcode', function () {
    $category = Category::factory()->create();
    $unit = Unit::factory()->create();

    $service = app(ProductService::class);

    $product = $service->create([
        'name' => 'Kopi Tanpa Barcode',
        'cost_price' => 1000,
        'price' => 1500,
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'stock' => 10,
    ]);

    expect($product)->not->toBeNull();
    expect($product->barcode)->not->toBeEmpty();
    expect($product->barcode)->toBeString();
});
