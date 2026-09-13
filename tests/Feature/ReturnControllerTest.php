<?php

use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Support\Enums\ReturnPermissionEnums;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can store return transaction', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate(ReturnPermissionEnums::CREATE_RETURN->value));
    $product = Product::factory()->create(['stock' => 10]);

    $transaction = Transaction::factory()->create();
    TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'unit_name' => 'Pcs',
        'quantity' => 2,
        'price' => 15000,
        'cost_price' => 10000,
        'discount' => 0,
    ]);

    $response = $this->actingAs($user)->postJson(route('apiReturns.store'), [
        'transaction_id' => $transaction->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'reason' => 'Barang cacat ringan',
    ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('returns', [
        'transaction_id' => $transaction->id,
        'total_refund_amount' => 15000,
    ]);
});

test('authenticated user can index returns', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate(ReturnPermissionEnums::READ_RETURN->value));
    $transaction = Transaction::factory()->create();
    ProductReturn::create([
        'return_number' => 'RET-20260728-TEST',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 30000,
        'reason' => 'Tes filter index',
    ]);

    $response = $this->actingAs($user)->getJson(route('apiReturns.index', ['keyword' => 'RET-20260728-TEST']));

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);
});

test('authenticated user can filter returns by start_date and end_date in Y-m-d format', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate(ReturnPermissionEnums::READ_RETURN->value));
    $transaction = Transaction::factory()->create();

    $r1 = ProductReturn::forceCreate([
        'return_number' => 'RET-DATE-001',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 10000,
        'reason' => 'Old',
        'created_at' => Carbon::parse('2026-02-01 10:00:00'),
    ]);
    $r2 = ProductReturn::forceCreate([
        'return_number' => 'RET-DATE-002',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 20000,
        'reason' => 'Target',
        'created_at' => Carbon::parse('2026-02-15 10:00:00'),
    ]);
    $r3 = ProductReturn::forceCreate([
        'return_number' => 'RET-DATE-003',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 30000,
        'reason' => 'Future',
        'created_at' => Carbon::parse('2026-03-01 10:00:00'),
    ]);

    $response = $this->actingAs($user)->getJson(route('apiReturns.index', [
        'start_date' => '2026-02-10',
        'end_date' => '2026-02-20',
    ]));

    $response->assertStatus(200)
        ->assertJson(['success' => true])
        ->assertJsonPath('data.items.0.return_number', 'RET-DATE-002')
        ->assertJsonCount(1, 'data.items');
});
