<?php

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it calculates the correct sold quantity from transaction details', function () {
    $product = Product::factory()->create();

    $transaction1 = Transaction::factory()->create();
    $transaction2 = Transaction::factory()->create();

    TransactionDetail::factory()->create([
        'product_id' => $product->id,
        'transaction_id' => $transaction1->id,
        'quantity' => 5,
    ]);

    TransactionDetail::factory()->create([
        'product_id' => $product->id,
        'transaction_id' => $transaction2->id,
        'quantity' => 3,
    ]);

    expect($product->fresh()->sold_quantity)->toBe(8);
});
