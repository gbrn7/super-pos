<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface ProfitWalletRepositoryInterface
{
    /**
     * Get the active profit wallet.
     */
    public function getActiveWallet(): ?ProfitWallet;

    /**
     * Lock and get active profit wallet for update.
     */
    public function lockActiveWalletForUpdate(): ?ProfitWallet;

    /**
     * Lock the wallet for update.
     */
    public function lockWalletForUpdate(int $id): ?ProfitWallet;

    /**
     * Create a wallet.
     */
    public function createWallet(array $data): ProfitWallet;

    /**
     * Update wallet balance.
     */
    public function updateWalletBalance(ProfitWallet $wallet, float $balance): bool;

    /**
     * Record a transaction in the ledger.
     */
    public function createTransaction(array $data): ProfitWalletTransaction;

    /**
     * Get transactions based on filter model.
     */
    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transaction summary matching filters.
     */
    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request, float $currentBalance): array;
}
