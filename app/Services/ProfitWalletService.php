<?php

namespace App\Services;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProfitWalletService implements ProfitWalletServiceInterface
{
    public function __construct(
        protected ProfitWalletRepositoryInterface $profitWalletRepository
    ) {}

    public function getOrCreateWallet(): ProfitWallet
    {
        try {
            return DB::transaction(function () {
                $wallet = $this->profitWalletRepository->lockActiveWalletForUpdate();

                if (! $wallet) {
                    $wallet = $this->profitWalletRepository->createWallet([
                        'balance' => 0.00,
                        'status' => 'active',
                    ]);
                }

                return $wallet;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function recordSalesProfit(float $profit, int $transactionId): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($profit, $transactionId) {
                $baseWallet = $this->getOrCreateWallet();
                $wallet = $this->profitWalletRepository->lockWalletForUpdate($baseWallet->id);

                $before = (float) $wallet->balance;
                $after = $before + $profit;
                $type = $profit >= 0 ? 'in' : 'out';
                $amount = abs($profit);

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => $type,
                    'transaction_type' => 'sales_profit',
                    'reference_id' => $transactionId,
                    'reference_type' => Transaction::class,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => 'Sales profit from POS checkout',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function disburse(float $amount, ?string $notes = null): ProfitWalletTransaction
    {
        try {
            if ($amount <= 0) {
                throw new Exception('Disbursement amount must be greater than zero.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return DB::transaction(function () use ($amount, $notes) {
                $baseWallet = $this->getOrCreateWallet();
                $wallet = $this->profitWalletRepository->lockWalletForUpdate($baseWallet->id);

                $before = (float) $wallet->balance;
                if ($before < $amount) {
                    throw new Exception('Insufficient wallet balance for disbursement.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => 'out',
                    'transaction_type' => 'disbursement',
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $notes ?? 'Disbursement to owner bank account',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function withdrawCapital(float $amount, ?string $notes = null): ProfitWalletTransaction
    {
        try {
            if ($amount <= 0) {
                throw new Exception('Capital withdrawal amount must be greater than zero.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return DB::transaction(function () use ($amount, $notes) {
                $baseWallet = $this->getOrCreateWallet();
                $wallet = $this->profitWalletRepository->lockWalletForUpdate($baseWallet->id);

                $before = (float) $wallet->balance;
                if ($before < $amount) {
                    throw new Exception('Insufficient wallet balance for capital withdrawal.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => 'out',
                    'transaction_type' => 'capital_withdrawal',
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $notes ?? 'Reinvestment/business capital withdrawal',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
