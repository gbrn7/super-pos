<?php

use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Enums\TransactionPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function cashierSetupUser(): User
{
    $role = Role::create(['name' => RoleEnums::SUPER_ADMIN->value]);
    $permission = Permission::create(['name' => TransactionPermissionEnums::CREATE_TRANSACTION->value]);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('checkout creates transaction and transaction details', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['price' => 10000, 'cost_price' => 7000, 'stock' => 10, 'is_unlimited' => false, 'is_active' => true]);

    $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 10000,
        'discount_amount' => 0,
        'payment_amount' => 20000,
        'change_amount' => 10000,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 1,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('success', true);

    // Transaction record created
    expect(Transaction::count())->toBe(1);

    $transaction = Transaction::first();
    expect($transaction->payment_method_id)->toBe($paymentMethod->id);
    expect((float) $transaction->total_amount)->toBe(10000.0);
    expect((float) $transaction->payment_amount)->toBe(20000.0);
    expect((float) $transaction->change_amount)->toBe(10000.0);
    expect($transaction->transactionDetails()->count())->toBe(1);
});

test('checkout decrements stock for non-unlimited product', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['price' => 5000, 'cost_price' => 3000, 'stock' => 10, 'is_unlimited' => false, 'is_active' => true]);

    $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 15000,
        'discount_amount' => 0,
        'payment_amount' => 20000,
        'change_amount' => 5000,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 3,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ]);

    expect($product->fresh()->stock)->toBe(7);
});

test('checkout does not decrement stock for unlimited product', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['price' => 5000, 'cost_price' => 3000, 'stock' => 0, 'is_unlimited' => true, 'is_active' => true]);

    $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 5000,
        'discount_amount' => 0,
        'payment_amount' => 5000,
        'change_amount' => 0,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 1,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ]);

    $response->assertStatus(201);
    // stock stays 0 (unlimited)
    expect($product->fresh()->stock)->toBe(0);
});

test('checkout applies discount_amount to transaction', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['price' => 10000, 'cost_price' => 7000, 'stock' => 10, 'is_unlimited' => false, 'is_active' => true]);

    $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 8000,
        'discount_amount' => 2000,
        'payment_amount' => 10000,
        'change_amount' => 2000,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 1,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ]);

    $transaction = Transaction::first();
    expect((float) $transaction->discount_amount)->toBe(2000.0);
    expect((float) $transaction->total_amount)->toBe(8000.0);
});

test('checkout fails with empty items', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);

    $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 0,
        'payment_amount' => 0,
        'change_amount' => 0,
        'items' => [],
    ]);

    $response->assertStatus(422);
});

test('checkout generates unique invoice number', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['price' => 5000, 'cost_price' => 3000, 'stock' => 20, 'is_unlimited' => false, 'is_active' => true]);

    $payload = [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 5000,
        'discount_amount' => 0,
        'payment_amount' => 5000,
        'change_amount' => 0,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 1,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ];

    $this->actingAs($user)->postJson('/api/transactions/checkout', $payload)->assertStatus(201);
    $this->actingAs($user)->postJson('/api/transactions/checkout', $payload)->assertStatus(201);

    $invoices = Transaction::pluck('invoice_number');
    expect($invoices)->toHaveCount(2);
    expect($invoices[0])->not->toBe($invoices[1]);
});

test('checkout fails when product is inactive', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['price' => 5000, 'cost_price' => 3000, 'stock' => 10, 'is_unlimited' => false, 'is_active' => false]);

    $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 5000,
        'discount_amount' => 0,
        'payment_amount' => 5000,
        'change_amount' => 0,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 1,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ]);

    $response->assertStatus(422);
    $response->assertJsonPath('message', 'Produk tidak aktif');
});

test('checkout fails when product stock is insufficient', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product = Product::factory()->create(['name' => 'Kopi Susu', 'price' => 5000, 'cost_price' => 3000, 'stock' => 2, 'is_unlimited' => false, 'is_active' => true]);

    $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 25000,
        'discount_amount' => 0,
        'payment_amount' => 25000,
        'change_amount' => 0,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => $product->unit->name,
                'quantity' => 5,
                'price' => $product->price,
                'cost_price' => $product->cost_price,
                'discount' => 0,
            ],
        ],
    ]);

    $response->assertStatus(422);
    $response->assertJsonPath('message', 'Stok produk Kopi Susu tidak mencukupi');
});

test('checkout recalculates total_amount on backend ignoring tampered input', function () {
    $user = cashierSetupUser();
    $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'desc' => '', 'image' => '']);
    $product1 = Product::factory()->create(['price' => 15000, 'cost_price' => 10000, 'stock' => 10, 'is_unlimited' => false, 'is_active' => true]);
    $product2 = Product::factory()->create(['price' => 25000, 'cost_price' => 18000, 'stock' => 10, 'is_unlimited' => false, 'is_active' => true]);

    // Send tampered total_amount of 100 instead of real total: (15000 * 2) + (25000 * 1 - 5000) - 2000 = 48000
    $response = $this->actingAs($user)->postJson('/api/transactions/checkout', [
        'payment_method_id' => $paymentMethod->id,
        'total_amount' => 100, // tampered total_amount
        'discount_amount' => 2000,
        'payment_amount' => 50000,
        'change_amount' => 0, // tampered change_amount
        'items' => [
            [
                'product_id' => $product1->id,
                'unit_name' => $product1->unit->name,
                'quantity' => 2,
                'price' => 15000,
                'cost_price' => 10000,
                'discount' => 0,
            ],
            [
                'product_id' => $product2->id,
                'unit_name' => $product2->unit->name,
                'quantity' => 1,
                'price' => 25000,
                'cost_price' => 18000,
                'discount' => 5000,
            ],
        ],
    ]);

    $response->assertStatus(201);
    $transaction = Transaction::first();

    // Calculated total: (15000*2) + ((25000-5000)*1) - 2000 = 30000 + 20000 - 2000 = 48000
    expect((float) $transaction->total_amount)->toBe(48000.0);
    // Calculated change: 50000 - 48000 = 2000
    expect((float) $transaction->change_amount)->toBe(2000.0);
});
