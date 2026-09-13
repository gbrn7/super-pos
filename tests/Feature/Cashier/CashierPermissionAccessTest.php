<?php

use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\TransactionPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createCashierOnlyUser(): User
{
    // Role that is not Super Admin and only has `create-transaction` permission
    $role = Role::create(['name' => 'Cashier Only']);
    $permission = Permission::create(['name' => TransactionPermissionEnums::CREATE_TRANSACTION->value]);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('user with only create-transaction permission can read products and scan barcode', function () {
    $user = createCashierOnlyUser();
    $product = Product::factory()->create(['barcode' => '123456789']);

    // Can read products list
    $this->actingAs($user)
        ->getJson(route('apiProducts.index'))
        ->assertOk();

    // Can get product by barcode
    $this->actingAs($user)
        ->getJson(route('apiProducts.getByBarcode', ['barcode' => '123456789']))
        ->assertOk();

    // Cannot create product
    $this->actingAs($user)
        ->postJson(route('apiProducts.store'), [])
        ->assertForbidden();
});

test('user with only create-transaction permission can read categories', function () {
    $user = createCashierOnlyUser();
    Category::factory()->create();

    // Can read categories list
    $this->actingAs($user)
        ->getJson(route('apiCategories.index'))
        ->assertOk();

    // Cannot create category
    $this->actingAs($user)
        ->postJson(route('apiCategories.store'), ['name' => 'Electronics'])
        ->assertForbidden();
});

test('user with only create-transaction permission can read payment methods', function () {
    $user = createCashierOnlyUser();
    PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);

    // Can read payment methods list
    $this->actingAs($user)
        ->getJson(route('apiPaymentMethods.index'))
        ->assertOk();

    // Cannot create payment method
    $this->actingAs($user)
        ->postJson(route('apiPaymentMethods.store'), ['name' => 'QRIS'])
        ->assertForbidden();
});

test('user with only create-transaction permission can read units', function () {
    $user = createCashierOnlyUser();
    Unit::factory()->create();

    // Can read units list
    $this->actingAs($user)
        ->getJson(route('apiUnits.index'))
        ->assertOk();

    // Cannot create unit
    $this->actingAs($user)
        ->postJson(route('apiUnits.store'), ['name' => 'Pcs'])
        ->assertForbidden();
});
