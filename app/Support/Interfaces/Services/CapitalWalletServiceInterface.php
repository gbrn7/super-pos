<?php

namespace App\Support\Interfaces\Services;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use App\Support\Models\CapitalWallet\DrawdownCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use App\Support\Models\CapitalWallet\InjectCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\PurchaseProductCapitalWalletReqModel;
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
    public function inject(InjectCapitalWalletReqModel $request): CapitalWalletTransaction;

    /**
     * Drawdown/withdraw capital from the wallet.
     */
    public function drawdown(DrawdownCapitalWalletReqModel $request): CapitalWalletTransaction;

    /**
     * Spend capital to purchase product stock.
     */
    public function purchaseProduct(PurchaseProductCapitalWalletReqModel $request): CapitalWalletTransaction;

    /**
     * Get transactions based on filter model.
     */
    public function getTransactions(GetCapitalWalletTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transaction summary matching filters.
     */
    public function getTransactionSummary(GetCapitalWalletTransactionReqModel $request): array;

    /**
     * Record capital deduction due to product return.
     */
    public function recordReturnCapitalDeduction(float $amount, int $returnId, ?string $invoiceNumber = null): CapitalWalletTransaction;

    /**
     * Export capital wallet transactions to Excel or PDF.
     */
    public function export(GetCapitalWalletTransactionReqModel $request, string $format);
}
