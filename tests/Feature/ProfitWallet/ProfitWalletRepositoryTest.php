<?php

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->repository = app(ProfitWalletRepositoryInterface::class);
});

test('repository handles wallet retrieval, creation, locking and updates', function () {
    $wallet = $this->repository->createWallet(['balance' => 0.00, 'status' => 'active']);
    expect($wallet)->toBeInstanceOf(ProfitWallet::class);

    $found = $this->repository->getActiveWallet();
    expect($found->id)->toBe($wallet->id);

    $locked = $this->repository->lockWalletForUpdate($wallet->id);
    expect($locked->id)->toBe($wallet->id);

    $lockedActive = $this->repository->lockActiveWalletForUpdate();
    expect($lockedActive->id)->toBe($wallet->id);

    $updated = $this->repository->updateWalletBalance($wallet, 5000.00);
    expect($updated)->toBeTrue()
        ->and($wallet->fresh()->balance)->toEqual(5000.00);
});

test('repository creates transactions correctly', function () {
    $wallet = $this->repository->createWallet(['balance' => 1000.00, 'status' => 'active']);

    $tx = $this->repository->createTransaction([
        'profit_wallet_id' => $wallet->id,
        'amount' => 500.00,
        'type' => 'in',
        'transaction_type' => 'sales_profit',
        'balance_before' => 500.00,
        'balance_after' => 1000.00,
        'notes' => 'Test deposit',
    ]);

    expect($tx)->toBeInstanceOf(ProfitWalletTransaction::class)
        ->and($tx->amount)->toEqual(500.00)
        ->and($tx->profit_wallet_id)->toBe($wallet->id);
});
