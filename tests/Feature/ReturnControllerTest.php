<?php

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can store return transaction', function () {
    $user = User::factory()->create();
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

    $response = $this->actingAs($user)->post(route('returns.store'), [
        'transaction_id' => $transaction->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'reason' => 'Barang cacat ringan',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('returns', [
        'transaction_id' => $transaction->id,
        'total_refund_amount' => 15000,
    ]);
});
