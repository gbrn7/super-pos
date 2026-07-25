<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CapitalWalletRepositoryInterface
{
    /**
     * Get the active capital wallet.
     */
    public function getActiveWallet(): ?CapitalWallet;

    /**
     * Lock and get active capital wallet for update.
     */
    public function lockActiveWalletForUpdate(): ?CapitalWallet;

    /**
     * Lock the wallet for update.
     */
    public function lockWalletForUpdate(int $id): ?CapitalWallet;

    /**
     * Create a wallet.
     */
    public function createWallet(array $data): CapitalWallet;

    /**
     * Update wallet balance, inflow, and outflow.
     */
    public function updateWalletBalance(CapitalWallet $wallet, float $balance, float $totalInflow, float $totalOutflow): bool;

    /**
     * Record a transaction in the ledger.
     */
    public function createTransaction(array $data): CapitalWalletTransaction;

    /**
     * Get transactions based on filter model.
     */
    public function getTransactions(GetCapitalWalletTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transaction summary matching filters.
     */
    public function getTransactionSummary(GetCapitalWalletTransactionReqModel $request, CapitalWallet $wallet): array;
}
