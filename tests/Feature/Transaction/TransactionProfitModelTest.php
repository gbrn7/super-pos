<?php

use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\TransactionProfit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('transaction has a profit relationship and correctly records profit values', function () {
    $user = User::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $transaction = Transaction::create([
        'user_id' => $user->id,
        'payment_method_id' => $paymentMethod->id,
        'invoice_number' => 'INV-TEST-001',
        'total_amount' => 150000.00,
        'payment_amount' => 200000.00,
        'change_amount' => 50000.00,
        'discount_amount' => 0.00,
    ]);

    $profit = TransactionProfit::create([
        'transaction_id' => $transaction->id,
        'total_revenue' => 150000.00,
        'total_cost' => 100000.00,
        'profit' => 50000.00,
    ]);

    expect($transaction->fresh()->transactionProfit)->not->toBeNull()
        ->and($transaction->fresh()->transactionProfit->profit)->toEqual(50000.00)
        ->and($profit->transaction->id)->toEqual($transaction->id);
});
