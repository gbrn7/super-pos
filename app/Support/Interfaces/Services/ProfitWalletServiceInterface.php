<?php

namespace App\Support\Interfaces\Services;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface ProfitWalletServiceInterface
{
    /**
     * Retrieve the active wallet, or create one if it doesn't exist.
     */
    public function getOrCreateWallet(): ProfitWallet;

    /**
     * Record profit from a sales transaction.
     */
    public function recordSalesProfit(float $profit, int $transactionId): ProfitWalletTransaction;

    /**
     * Get transactions based on filter model.
     */
    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transaction summary matching filters.
     */
    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request): array;

    /**
     * Withdraw/Disburse money to the owner's bank account.
     */
    public function disburse(DisburseProfitWalletReqModel $request): ProfitWalletTransaction;

    /**
     * Withdraw money to reinvest as capital.
     */
    public function withdrawCapital(WithdrawCapitalProfitWalletReqModel $request): ProfitWalletTransaction;
}
