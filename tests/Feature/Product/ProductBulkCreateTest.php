<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Services\ProductServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

test('api bulk create products with images endpoint', function () {
    Storage::fake('public');

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
                    'name' => 'API Bulk Product Image 1',
                    'cost_price' => 5000,
                    'price' => 10000,
                    'barcode' => 'BARCODE-IMG-001',
                    'image' => UploadedFile::fake()->image('test1.jpg'),
                ],
                [
                    'category_id' => $category->id,
                    'unit_id' => $unit->id,
                    'name' => 'API Bulk Product Image 2',
                    'cost_price' => 8000,
                    'price' => 15000,
                    'barcode' => 'BARCODE-IMG-002',
                    'image' => UploadedFile::fake()->image('test2.jpg'),
                ],
            ],
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertCreated();

    $this->assertDatabaseHas('products', [
        'barcode' => 'BARCODE-IMG-001',
    ]);

    $product = Product::where('barcode', 'BARCODE-IMG-001')->first();
    expect($product->image)->not->toBeNull();
    Storage::disk('public')->assertExists($product->image);
});

it('generates barcodes when bulk creating products without barcodes', function () {
    $category = Category::factory()->create();
    $unit = Unit::create(['name' => 'PCS']);

    $productsData = [
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Bulk No Barcode 1',
            'cost_price' => 5000,
            'price' => 10000,
        ],
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Bulk No Barcode 2',
            'cost_price' => 8000,
            'price' => 15000,
        ],
    ];

    $service = app(ProductServiceInterface::class);

    $count = $service->bulkCreate($productsData);

    expect($count)->toBe(2);

    $p1 = Product::where('name', 'Bulk No Barcode 1')->first();
    $p2 = Product::where('name', 'Bulk No Barcode 2')->first();

    expect($p1->barcode)->not->toBeNull();
    expect($p2->barcode)->not->toBeNull();
    expect($p1->barcode)->not->toEqual($p2->barcode);
});
