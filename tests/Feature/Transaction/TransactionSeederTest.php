<?php

use App\Models\Transaction;
use App\Models\TransactionDetail;
use Database\Seeders\TransactionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('transaction seeder creates transactions and transaction details', function () {
    $this->seed(TransactionSeeder::class);

    expect(Transaction::count())->toBeGreaterThan(0);
    expect(TransactionDetail::count())->toBeGreaterThan(0);

    $transaction = Transaction::with('transactionDetails')->first();

    expect($transaction)->not->toBeNull();
    expect($transaction->transactionDetails->isEmpty())->toBeFalse();
    expect((float) $transaction->total_amount)->toBeGreaterThan(0);
    expect((float) $transaction->payment_amount)->toBeGreaterThanOrEqual((float) $transaction->total_amount);
});
