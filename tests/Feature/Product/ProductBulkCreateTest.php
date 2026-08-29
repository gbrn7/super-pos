<?php

use App\Models\Category;
use App\Models\MasterProduct;
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

test('it syncs master products when bulk creating products', function () {
    $category = Category::factory()->create(['name' => 'Kategori Test']);
    $unit = Unit::create(['name' => 'PCS']);

    $masterProduct = MasterProduct::create([
        'name' => 'Existing Master',
        'barcode' => 'BARCODE-BULK-001',
        'cost_price' => 1000,
        'price' => 2000,
        'category_name' => 'Old Cat',
        'unit_name' => 'Old Unit',
    ]);

    $productsData = [
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'Existing Master Updated',
            'cost_price' => 5000,
            'price' => 10000,
            'barcode' => 'BARCODE-BULK-001',
        ],
        [
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'name' => 'New Bulk Product',
            'cost_price' => 8000,
            'price' => 15000,
            'barcode' => 'BARCODE-BULK-002',
        ],
    ];

    $service = app(ProductServiceInterface::class);

    $count = $service->bulkCreate($productsData);

    expect($count)->toBe(2);

    $masterProduct->refresh();
    expect((float) $masterProduct->cost_price)->toEqual(5000.0)
        ->and((float) $masterProduct->price)->toEqual(10000.0)
        ->and($masterProduct->category_name)->toBe('Kategori Test')
        ->and($masterProduct->unit_name)->toBe('PCS');

    $newMaster = MasterProduct::where('barcode', 'BARCODE-BULK-002')->first();
    expect($newMaster)->not->toBeNull()
        ->and($newMaster->name)->toBe('New Bulk Product')
        ->and((float) $newMaster->cost_price)->toEqual(8000.0)
        ->and((float) $newMaster->price)->toEqual(15000.0)
        ->and($newMaster->category_name)->toBe('Kategori Test')
        ->and($newMaster->unit_name)->toBe('PCS');
});
