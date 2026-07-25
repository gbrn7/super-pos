<?php

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('models support relationships and Unix date format serialization', function () {
    $wallet = ProfitWallet::factory()->create(['balance' => 1500.00]);
    $transaction = Transaction::factory()->create();

    $walletTx = ProfitWalletTransaction::factory()->create([
        'profit_wallet_id' => $wallet->id,
        'amount' => 500.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'reference_id' => $transaction->id,
        'reference_type' => get_class($transaction),
        'balance_before' => 1000.00,
        'balance_after' => 1500.00,
    ]);

    expect($wallet->transactions)->toHaveCount(1)
        ->and($wallet->transactions->first()->id)->toBe($walletTx->id);

    expect($walletTx->wallet->id)->toBe($wallet->id);
    expect($walletTx->reference->id)->toBe($transaction->id);
    expect($transaction->profitWalletTransaction->id)->toBe($walletTx->id);

    // Verify timestamp custom serialization
    $serialized = $wallet->toArray();
    expect($serialized['created_at'])->toBeInt();
});
