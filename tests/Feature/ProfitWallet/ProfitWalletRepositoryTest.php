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
    $found = $this->repository->getActiveWallet();
    expect($found)->toBeInstanceOf(ProfitWallet::class);

    $locked = $this->repository->lockWalletForUpdate($found->id);
    expect($locked->id)->toBe($found->id);

    $lockedActive = $this->repository->lockActiveWalletForUpdate();
    expect($lockedActive->id)->toBe($found->id);

    $updated = $this->repository->updateWalletBalance($found, 5000.00, 10000.00, 2000.00);
    expect($updated)->toBeTrue()
        ->and($found->fresh()->balance)->toEqual(5000.00)
        ->and($found->fresh()->total_inflow)->toEqual(10000.00)
        ->and($found->fresh()->total_outflow)->toEqual(2000.00);

    $newWallet = $this->repository->createWallet(['balance' => 100.00, 'status' => 'inactive']);
    expect($newWallet)->toBeInstanceOf(ProfitWallet::class)
        ->and($newWallet->status)->toBe('inactive');
});

test('repository creates transactions correctly', function () {
    $wallet = $this->repository->getActiveWallet();

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
