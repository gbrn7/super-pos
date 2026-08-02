<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('api print product barcode returns 422 when product has no barcode', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);

    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $product = Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Product Without Barcode',
        'sku' => 'PWB-001',
        'barcode' => null,
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 10,
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson(route('apiProducts.printBarcode', ['id' => $product->id]), [
            'quantity' => 5,
        ]);

    $response
        ->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => trans('message.error.barcode_not_found'),
        ]);
});

test('api print product barcode returns pdf when product has barcode', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);

    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $product = Product::create([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'name' => 'Product With Barcode',
        'sku' => 'PWB-002',
        'barcode' => '899123456789',
        'cost_price' => 5000,
        'price' => 10000,
        'stock' => 10,
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson(route('apiProducts.printBarcode', ['id' => $product->id]), [
            'quantity' => 5,
        ]);

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});
