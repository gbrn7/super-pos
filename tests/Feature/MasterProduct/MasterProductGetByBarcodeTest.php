<?php

use App\Models\MasterProduct;
use App\Models\Role;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Services\MasterProductServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can get master product by barcode via service', function () {
    $masterProduct = MasterProduct::create([
        'name' => 'Test Master Product Barcode',
        'category_name' => 'Makanan',
        'unit_name' => 'PCS',
        'barcode' => '899123456789',
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 10,
    ]);

    $service = app(MasterProductServiceInterface::class);
    $foundProduct = $service->getByBarcode('899123456789');

    expect($foundProduct)->not->toBeNull()
        ->and($foundProduct->id)->toBe($masterProduct->id)
        ->and($foundProduct->name)->toBe('Test Master Product Barcode')
        ->and($foundProduct->barcode)->toBe('899123456789');
});

it('throws 404 exception when master product is not found by barcode via service', function () {
    $service = app(MasterProductServiceInterface::class);

    $service->getByBarcode('NONEXISTENT_BARCODE');
})->throws(Exception::class);

test('api get master product by barcode endpoint returns master product data', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);

    $masterProduct = MasterProduct::create([
        'name' => 'API Master Product Barcode',
        'category_name' => 'Minuman',
        'unit_name' => 'Botol',
        'barcode' => '899999999999',
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 15,
    ]);

    $response = $this
        ->actingAs($user)
        ->getJson(route('apiMasterProducts.getByBarcode', ['barcode' => '899999999999']));

    $response
        ->assertOk()
        ->assertJson([
            'success' => true,
            'data' => [
                'id' => $masterProduct->id,
                'name' => 'API Master Product Barcode',
                'barcode' => '899999999999',
                'category_name' => 'Minuman',
                'unit_name' => 'Botol',
                'price' => '10000.00',
                'cost_price' => '5000.00',
            ],
        ]);
});

test('api get master product by barcode endpoint returns 404 when barcode not found', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);

    $response = $this
        ->actingAs($user)
        ->getJson(route('apiMasterProducts.getByBarcode', ['barcode' => 'NOTFOUND123']));

    $response
        ->assertNotFound()
        ->assertJson([
            'success' => false,
            'data' => null,
        ]);
});
