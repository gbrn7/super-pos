<?php

use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProfitWallet;
use App\Models\User;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(TransactionServiceInterface::class);
});

test('checkout automatically updates profit wallet', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $paymentMethod = PaymentMethod::factory()->create();
    $product = Product::factory()->create([
        'price' => 10000,
        'cost_price' => 7000,
        'stock' => 10,
        'is_active' => true,
        'is_unlimited' => false,
    ]);

    $checkoutData = [
        'payment_method_id' => $paymentMethod->id,
        'discount_amount' => 1000,
        'payment_amount' => 10000,
        'items' => [
            [
                'product_id' => $product->id,
                'unit_name' => 'PCS',
                'quantity' => 1,
                'price' => 10000,
                'cost_price' => 7000,
                'discount' => 0,
            ],
        ],
    ];

    $transaction = $this->service->checkout($checkoutData);

    $wallet = ProfitWallet::where('status', 'active')->first();
    expect($wallet)->not->toBeNull()
        ->and((float) $wallet->balance)->toEqual(2000.00);

    $this->assertDatabaseHas('profit_wallet_transactions', [
        'profit_wallet_id' => $wallet->id,
        'amount' => 2000.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'reference_id' => $transaction->id,
        'reference_type' => get_class($transaction),
        'balance_before' => 0.00,
        'balance_after' => 2000.00,
    ]);
});
