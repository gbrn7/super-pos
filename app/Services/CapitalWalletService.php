<?php

namespace App\Services;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use App\Models\ProductReturn;
use App\Models\ProfitWalletTransaction;
use App\Models\Transaction;
use App\Support\Enums\CapitalWalletStatusEnums;
use App\Support\Enums\CapitalWalletTransactionDirectionEnums;
use App\Support\Enums\CapitalWalletTransactionTypeEnums;
use App\Support\Interfaces\Repositories\CapitalWalletRepositoryInterface;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Models\CapitalWallet\DrawdownCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use App\Support\Models\CapitalWallet\InjectCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\PurchaseProductCapitalWalletReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CapitalWalletService implements CapitalWalletServiceInterface
{
    public function __construct(
        protected CapitalWalletRepositoryInterface $capitalWalletRepository
    ) {}

    public function getOrCreateWallet(): CapitalWallet
    {
        try {
            return DB::transaction(function () {
                $wallet = $this->capitalWalletRepository->lockActiveWalletForUpdate();

                if (! $wallet) {
                    $wallet = $this->capitalWalletRepository->createWallet([
                        'balance' => 0.00,
                        'status' => CapitalWalletStatusEnums::ACTIVE->value,
                    ]);
                }

                return $wallet;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function recordSalesCapital(float $amount, int $transactionId): CapitalWalletTransaction
    {
        try {
            return DB::transaction(function () use ($amount, $transactionId) {
                if ($amount <= 0) {
                    throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                $after = $before + $amount;

                $transaction = $this->capitalWalletRepository->createTransaction([
                    'capital_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => CapitalWalletTransactionDirectionEnums::IN->value,
                    'transaction_type' => CapitalWalletTransactionTypeEnums::SALES_CAPITAL_RECOVERY->value,
                    'reference_id' => $transactionId,
                    'reference_type' => Transaction::class,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => trans('message.success.capital_wallet.sales_recovery_notes'),
                ]);

                $inflowUpdate = (float) $wallet->total_inflow + $amount;
                $this->capitalWalletRepository->updateWalletBalance($wallet, $after, $inflowUpdate, (float) $wallet->total_outflow);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function recordReinvestment(float $amount, int $profitWalletTransactionId): CapitalWalletTransaction
    {
        try {
            return DB::transaction(function () use ($amount, $profitWalletTransactionId) {
                if ($amount <= 0) {
                    throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                $after = $before + $amount;

                $transaction = $this->capitalWalletRepository->createTransaction([
                    'capital_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => CapitalWalletTransactionDirectionEnums::IN->value,
                    'transaction_type' => CapitalWalletTransactionTypeEnums::REINVESTMENT->value,
                    'reference_id' => $profitWalletTransactionId,
                    'reference_type' => ProfitWalletTransaction::class,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => trans('message.success.capital_wallet.reinvestment_notes'),
                ]);

                $inflowUpdate = (float) $wallet->total_inflow + $amount;
                $this->capitalWalletRepository->updateWalletBalance($wallet, $after, $inflowUpdate, (float) $wallet->total_outflow);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function inject(InjectCapitalWalletReqModel $request): CapitalWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                $after = $before + $request->amount;

                $transaction = $this->capitalWalletRepository->createTransaction([
                    'capital_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => CapitalWalletTransactionDirectionEnums::IN->value,
                    'transaction_type' => CapitalWalletTransactionTypeEnums::CAPITAL_INJECTION->value,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Capital injection',
                ]);

                $inflowUpdate = (float) $wallet->total_inflow + $request->amount;
                $this->capitalWalletRepository->updateWalletBalance($wallet, $after, $inflowUpdate, (float) $wallet->total_outflow);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function drawdown(DrawdownCapitalWalletReqModel $request): CapitalWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                if ($before < $request->amount) {
                    throw new Exception(trans('message.error.capital_wallet.insufficient_balance_for_drawdown'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $request->amount;

                $transaction = $this->capitalWalletRepository->createTransaction([
                    'capital_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => CapitalWalletTransactionDirectionEnums::OUT->value,
                    'transaction_type' => CapitalWalletTransactionTypeEnums::CAPITAL_DRAWDOWN->value,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Capital drawdown',
                ]);

                $outflowUpdate = (float) $wallet->total_outflow + $request->amount;
                $this->capitalWalletRepository->updateWalletBalance($wallet, $after, (float) $wallet->total_inflow, $outflowUpdate);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function purchaseProduct(PurchaseProductCapitalWalletReqModel $request): CapitalWalletTransaction
    {
        try {
            return DB::transaction(function () use ($request) {
                if ($request->amount <= 0) {
                    throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                if ($before < $request->amount) {
                    throw new Exception(trans('message.error.capital_wallet.insufficient_balance_for_purchase'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $after = $before - $request->amount;

                $transaction = $this->capitalWalletRepository->createTransaction([
                    'capital_wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'type' => CapitalWalletTransactionDirectionEnums::OUT->value,
                    'transaction_type' => CapitalWalletTransactionTypeEnums::PRODUCT_PURCHASE->value,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => $request->notes ?? 'Product purchase',
                ]);

                $outflowUpdate = (float) $wallet->total_outflow + $request->amount;
                $this->capitalWalletRepository->updateWalletBalance($wallet, $after, (float) $wallet->total_inflow, $outflowUpdate);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getTransactions(GetCapitalWalletTransactionReqModel $request): Paginator|Collection
    {
        try {
            return $this->capitalWalletRepository->getTransactions($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getTransactionSummary(GetCapitalWalletTransactionReqModel $request): array
    {
        try {
            $wallet = $this->getOrCreateWallet();

            return $this->capitalWalletRepository->getTransactionSummary($request, $wallet);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function recordReturnCapitalDeduction(float $amount, int $returnId, ?string $invoiceNumber = null): CapitalWalletTransaction
    {
        try {
            return DB::transaction(function () use ($amount, $returnId, $invoiceNumber) {
                if ($amount <= 0) {
                    throw new Exception(trans('message.error.capital_wallet.amount_must_be_greater_than_zero'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $wallet = $this->getOrCreateWallet();

                $before = (float) $wallet->balance;
                $after = $before - $amount;

                $transaction = $this->capitalWalletRepository->createTransaction([
                    'capital_wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'type' => CapitalWalletTransactionDirectionEnums::OUT->value,
                    'transaction_type' => CapitalWalletTransactionTypeEnums::SALES_RETURN_DEDUCTION->value,
                    'reference_id' => $returnId,
                    'reference_type' => ProductReturn::class,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'notes' => trans('message.success.capital_wallet.return_notes', ['invoice' => $invoiceNumber ?? ('#'.$returnId)]),
                ]);

                $outflowUpdate = (float) $wallet->total_outflow + $amount;
                $this->capitalWalletRepository->updateWalletBalance($wallet, $after, (float) $wallet->total_inflow, $outflowUpdate);

                return $transaction;
            });
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
