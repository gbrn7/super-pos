<?php

use App\Models\CashProfit;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('transaction has a cash profit relationship and correctly records profit data', function () {
    $user = User::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $transaction = Transaction::create([
        'user_id' => $user->id,
        'payment_method_id' => $paymentMethod->id,
        'invoice_number' => 'INV-TEST-001',
        'total_amount' => 150000.00,
        'payment_amount' => 200000.00,
        'change_amount' => 50000.00,
    ]);

    $cashProfit = CashProfit::create([
        'transaction_id' => $transaction->id,
        'profit' => 50000.00,
    ]);

    expect($transaction->cashProfit)->not->toBeNull()
        ->and($transaction->cashProfit->profit)->toEqual('50000.00')
        ->and($cashProfit->transaction->id)->toEqual($transaction->id);
});
