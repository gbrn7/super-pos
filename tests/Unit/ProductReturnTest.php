<?php

use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\ReturnDetail;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('return model has correct relationships', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->create();
    $product = Product::factory()->create();

    $return = ProductReturn::create([
        'return_number' => 'RET-20260728-0001',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 50000,
        'reason' => 'Barang salah warna',
    ]);

    $returnDetail = ReturnDetail::create([
        'return_id' => $return->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'price_per_unit' => 25000,
        'subtotal' => 50000,
    ]);

    expect($return->transaction->id)->toBe($transaction->id);
    expect($return->user->id)->toBe($user->id);
    expect($return->details)->toHaveCount(1);
    expect($return->details->first()->product->id)->toBe($product->id);
});
