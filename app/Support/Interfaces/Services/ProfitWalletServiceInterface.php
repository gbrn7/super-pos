<?php

namespace App\Support\Interfaces\Services;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;

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
     * Withdraw/Disburse money to the owner's bank account.
     */
    public function disburse(float $amount, ?string $notes = null): ProfitWalletTransaction;

    /**
     * Withdraw money to reinvest as capital.
     */
    public function withdrawCapital(float $amount, ?string $notes = null): ProfitWalletTransaction;
}
