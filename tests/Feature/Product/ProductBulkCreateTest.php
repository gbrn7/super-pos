<?php

use App\Models\Category;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Services\ProductServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can bulk create products successfully', function () {
    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $productsData = [
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Bulk Product 1',
            'cost_price' => 5000,
            'price' => 10000,
            'barcode' => 'BARCODE-001',
        ],
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Bulk Product 2',
            'cost_price' => 8000,
            'price' => 15000,
            'barcode' => 'BARCODE-002',
        ],
    ];

    $service = app(ProductServiceInterface::class);

    $count = $service->bulkCreate($productsData);

    expect($count)->toBe(2);

    $this->assertDatabaseHas('products', [
        'name' => 'Bulk Product 1',
        'barcode' => 'BARCODE-001',
    ]);

    $this->assertDatabaseHas('products', [
        'name' => 'Bulk Product 2',
        'barcode' => 'BARCODE-002',
    ]);
});

it('rolls back database transaction when cost price is greater than price in bulk create', function () {
    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $productsData = [
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Valid Product',
            'cost_price' => 5000,
            'price' => 10000,
            'barcode' => 'BARCODE-100',
        ],
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Invalid Product',
            'cost_price' => 15000, // Invalid: cost_price > price
            'price' => 10000,
            'barcode' => 'BARCODE-101',
        ],
    ];

    $service = app(ProductServiceInterface::class);

    expect(fn () => $service->bulkCreate($productsData))->toThrow(Exception::class);

    $this->assertDatabaseMissing('products', [
        'barcode' => 'BARCODE-100',
    ]);
});

test('api bulk create products endpoint', function () {
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);
    $category = Category::factory()->create();
    $unit = Unit::firstOrCreate(['name' => 'PCS']);

    $response = $this
        ->actingAs($user)
        ->postJson(route('apiProducts.bulkStore'), [
            'products' => [
                [
                    'category_id' => $category->id,
                    'unit_id' => $unit->id,
                    'name' => 'API Bulk Product 1',
                    'cost_price' => 5000,
                    'price' => 10000,
                    'barcode' => 'BARCODE-API-001',
                ],
                [
                    'category_id' => $category->id,
                    'unit_id' => $unit->id,
                    'name' => 'API Bulk Product 2',
                    'cost_price' => 8000,
                    'price' => 15000,
                    'barcode' => 'BARCODE-API-002',
                ],
            ],
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertCreated();

    $this->assertDatabaseHas('products', [
        'barcode' => 'BARCODE-API-001',
    ]);
});
