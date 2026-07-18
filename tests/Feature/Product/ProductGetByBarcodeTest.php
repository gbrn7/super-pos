<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Services\ProductServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can get product by barcode via service', function () {
    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $product = Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Test Product Barcode',
        'sku' => 'TPB-001',
        'barcode' => '899123456789',
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 10,
    ]);

    $service = app(ProductServiceInterface::class);
    $foundProduct = $service->getByBarcode('899123456789');

    expect($foundProduct)->not->toBeNull()
        ->and($foundProduct->id)->toBe($product->id)
        ->and($foundProduct->name)->toBe('Test Product Barcode')
        ->and($foundProduct->barcode)->toBe('899123456789');
});

it('throws 404 exception when product is not found by barcode via service', function () {
    $service = app(ProductServiceInterface::class);

    $service->getByBarcode('NONEXISTENT_BARCODE');
})->throws(Exception::class);

test('api get product by barcode endpoint returns product data', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);

    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $product = Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'API Product Barcode',
        'sku' => 'APB-001',
        'barcode' => '899999999999',
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 15,
    ]);

    $response = $this
        ->actingAs($user)
        ->getJson(route('apiProducts.getByBarcode', ['barcode' => '899999999999']));

    $response
        ->assertOk()
        ->assertJson([
            'success' => true,
            'data' => [
                'id' => $product->id,
                'name' => 'API Product Barcode',
                'barcode' => '899999999999',
                'sku' => 'APB-001',
                'category_id' => $category->id,
                'category_name' => $category->name,
                'unit_id' => $unit->id,
                'unit_name' => $unit->name,
                'price' => 10000,
                'cost_price' => 5000,
                'stock' => 15,
            ],
        ]);
});

test('api get product by barcode endpoint returns 404 when barcode not found', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);

    $response = $this
        ->actingAs($user)
        ->getJson(route('apiProducts.getByBarcode', ['barcode' => 'NOTFOUND123']));

    $response
        ->assertNotFound()
        ->assertJson([
            'success' => false,
            'data' => null,
        ]);
});
