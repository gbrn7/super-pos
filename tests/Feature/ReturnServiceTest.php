<?php

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Services\ReturnService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('return service processes partial return and updates product stock correctly', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 10]);

    $transaction = Transaction::factory()->create();
    TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'unit_name' => 'Pcs',
        'quantity' => 5,
        'price' => 20000,
        'cost_price' => 15000,
        'discount' => 0,
    ]);

    $service = resolve(ReturnService::class);
    $return = $service->processReturn(
        transactionId: $transaction->id,
        items: [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        reason: 'Customer tukar ukuran',
        user: $user
    );

    expect($return)->not->toBeNull();
    expect((float) $return->total_refund_amount)->toEqual(40000.0);
    expect($product->fresh()->stock)->toBe(12);
});
