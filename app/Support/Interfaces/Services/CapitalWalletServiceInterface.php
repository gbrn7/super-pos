<?php

namespace App\Support\Interfaces\Services;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CapitalWalletServiceInterface
{
    /**
     * Retrieve the active wallet, or create one if it doesn't exist.
     */
    public function getOrCreateWallet(): CapitalWallet;

    /**
     * Record capital recovery from a sales transaction.
     */
    public function recordSalesCapital(float $amount, int $transactionId): CapitalWalletTransaction;

    /**
     * Record reinvestment from the profit wallet.
     */
    public function recordReinvestment(float $amount, int $profitWalletTransactionId): CapitalWalletTransaction;

    /**
     * Inject capital into the wallet.
     */
    public function inject(float $amount, ?string $notes): CapitalWalletTransaction;

    /**
     * Drawdown/withdraw capital from the wallet.
     */
    public function drawdown(float $amount, ?string $notes): CapitalWalletTransaction;

    /**
     * Spend capital to purchase product stock.
     */
    public function purchaseProduct(float $amount, ?string $notes): CapitalWalletTransaction;

    /**
     * Get transactions based on filter model.
     */
    public function getTransactions(GetCapitalWalletTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transaction summary matching filters.
     */
    public function getTransactionSummary(GetCapitalWalletTransactionReqModel $request): array;
}
