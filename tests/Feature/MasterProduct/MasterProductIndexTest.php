<?php

use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\MasterProductPermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('api master product index can filter by is_added status', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permission = Permission::create(['name' => MasterProductPermissionEnums::READ_MASTER_PRODUCT->value]);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    $category = Category::create(['name' => 'Makanan']);
    $unit = Unit::create(['name' => 'PCS']);

    $addedProduct = MasterProduct::create([
        'name' => 'Master Product Added',
        'category_name' => 'Makanan',
        'unit_name' => 'PCS',
        'barcode' => 'BARCODE111',
        'cost_price' => 5000,
        'price' => 10000,
    ]);

    $notAddedProduct = MasterProduct::create([
        'name' => 'Master Product Not Added',
        'category_name' => 'Makanan',
        'unit_name' => 'PCS',
        'barcode' => 'BARCODE222',
        'cost_price' => 3000,
        'price' => 6000,
    ]);

    Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'sku' => 'SKU111',
        'name' => 'Master Product Added',
        'barcode' => 'BARCODE111',
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 10,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    // Test filter is_added = true
    $resAdded = $this
        ->actingAs($user)
        ->getJson(route('apiMasterProducts.index', ['is_added' => 'true', 'limit' => 10]));

    $resAdded->assertOk();
    expect($resAdded->json('data.items'))->toHaveCount(1)
        ->and($resAdded->json('data.items.0.barcode'))->toBe('BARCODE111');

    // Test filter is_added = false
    $resNotAdded = $this
        ->actingAs($user)
        ->getJson(route('apiMasterProducts.index', ['is_added' => 'false', 'limit' => 10]));

    $resNotAdded->assertOk();
    expect($resNotAdded->json('data.items'))->toHaveCount(1)
        ->and($resNotAdded->json('data.items.0.barcode'))->toBe('BARCODE222');
});
