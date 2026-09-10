<?php

use App\Models\Category;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\ProductPermissionEnums;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('api update product returns unit_name and category_name', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permission = Permission::create(['name' => ProductPermissionEnums::UPDATE_PRODUCT->value]);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    $category = Category::factory()->create(['name' => 'Minuman']);
    $unit = Unit::create(['name' => 'Botol']);

    $product = Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Teh Botol',
        'sku' => 'TB-001',
        'barcode' => '899123456780',
        'cost_price' => 3000,
        'price' => 5000,
        'stock' => 10,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    $response = $this->actingAs($user)->putJson(route('apiProducts.update', $product->id), [
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Teh Botol Sosro',
        'cost_price' => 3000,
        'price' => 5000,
        'stock' => 25,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'Teh Botol Sosro')
        ->assertJsonPath('data.stock', 25)
        ->assertJsonPath('data.unit_name', 'Botol')
        ->assertJsonPath('data.category_name', 'Minuman');
});
