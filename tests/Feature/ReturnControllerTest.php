<?php

use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Support\Enums\ReturnPermissionEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

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
