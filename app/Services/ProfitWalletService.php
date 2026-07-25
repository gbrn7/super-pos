<?php

namespace App\Services;

use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Support\Enums\ProfitWalletStatusEnums;
use App\Support\Enums\ProfitWalletTransactionDirectionEnums;
use App\Support\Enums\ProfitWalletTransactionTypeEnums;
use App\Support\Interfaces\Repositories\ProfitWalletRepositoryInterface;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
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
                        'status' => ProfitWalletStatusEnums::ACTIVE->value,
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
                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                $after = $before + $profit;
                $type = $profit >= 0 ? ProfitWalletTransactionDirectionEnums::IN->value : ProfitWalletTransactionDirectionEnums::OUT->value;
                $amount = abs($profit);

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => $type,
                    'transaction_type' => ProfitWalletTransactionTypeEnums::SALES_PROFIT->value,
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

    public function getTransactions(GetProfitWalletTransactionReqModel $request): Paginator|Collection
    {
        try {
            return $this->profitWalletRepository->getTransactions($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getTransactionSummary(GetProfitWalletTransactionReqModel $request): array
    {
        try {
            $wallet = $this->getOrCreateWallet();

            return $this->profitWalletRepository->getTransactionSummary($request, (float) $wallet->balance);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function disburse(DisburseProfitWalletReqModel $request): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception(trans('message.error.profit_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                if ($before < $request->amount) {
                    throw new Exception(trans('message.error.profit_wallet.insufficient_balance_for_disbursement'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $request->amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => ProfitWalletTransactionDirectionEnums::OUT->value,
                    'transaction_type' => ProfitWalletTransactionTypeEnums::DISBURSEMENT->value,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Disbursement to owner bank account',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function withdrawCapital(WithdrawCapitalProfitWalletReqModel $request): ProfitWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception(trans('message.error.profit_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                if ($before < $request->amount) {
                    throw new Exception(trans('message.error.profit_wallet.insufficient_balance_for_capital_withdrawal'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $request->amount;

                $transaction = $this->profitWalletRepository->createTransaction([
                    'profit_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => ProfitWalletTransactionDirectionEnums::OUT->value,
                    'transaction_type' => ProfitWalletTransactionTypeEnums::CAPITAL_WITHDRAWAL->value,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Reinvestment/business capital withdrawal',
                ]);

                $this->profitWalletRepository->updateWalletBalance($wallet, $after);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
