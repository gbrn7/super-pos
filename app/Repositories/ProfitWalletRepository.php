<?php

namespace App\Repositories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;

class ProfitWalletRepository implements ProfitWalletRepositoryInterface
{
    public function getActiveWallet(): ?ProfitWallet
    {
        return ProfitWallet::where('status', 'active')->first();
    }

    public function lockWalletForUpdate(int $id): ?ProfitWallet
    {
        return ProfitWallet::where('id', $id)->lockForUpdate()->first();
    }

    public function createWallet(array $data): ProfitWallet
    {
        return ProfitWallet::create($data);
    }

    public function updateWalletBalance(ProfitWallet $wallet, float $balance): bool
    {
        return $wallet->update(['balance' => $balance]);
    }

    public function createTransaction(array $data): ProfitWalletTransaction
    {
        return ProfitWalletTransaction::create($data);
    }
}
