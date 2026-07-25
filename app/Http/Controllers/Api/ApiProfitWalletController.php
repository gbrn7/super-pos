<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfitWallet\DisburseProfitWalletRequest;
use App\Http\Requests\ProfitWallet\IndexProfitWalletRequest;
use App\Http\Requests\ProfitWallet\WithdrawCapitalProfitWalletRequest;
use App\Http\Resources\ProfitWalletTransactionResource;
use App\Support\Enums\ProfitWalletPermissionEnums;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
use App\Support\Models\ProfitWallet\DisburseProfitWalletReqModel;
use App\Support\Models\ProfitWallet\GetProfitWalletTransactionReqModel;
use App\Support\Models\ProfitWallet\WithdrawCapitalProfitWalletReqModel;
use App\Support\Utils\PaginationResource;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiProfitWalletController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ProfitWalletServiceInterface $profitWalletService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value, only: ['index']),
            new Middleware('permission:'.ProfitWalletPermissionEnums::DISBURSE_PROFIT_WALLET->value, only: ['disburse']),
            new Middleware('permission:'.ProfitWalletPermissionEnums::WITHDRAW_CAPITAL_PROFIT_WALLET->value, only: ['withdrawCapital']),
        ];
    }

    public function index(IndexProfitWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new GetProfitWalletTransactionReqModel($request);

            $summary = $this->profitWalletService->getTransactionSummary($reqModel);
            $paginated = $this->profitWalletService->getTransactions($reqModel);

            $items = ProfitWalletTransactionResource::collection($paginated->items());
            $paginationData = PaginationResource::make($items, $paginated);

            return ResponseApi::make(true, trans('message.success.success'), [
                'summary' => $summary,
                'transactions' => [
                    'items' => $items,
                    'pagination' => $paginationData['pagination'],
                ],
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 500);
        }
    }

    public function disburse(DisburseProfitWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new DisburseProfitWalletReqModel($request);
            $tx = $this->profitWalletService->disburse($reqModel);

            return ResponseApi::make(true, trans('message.success.success'), [
                'transaction_id' => $tx->id,
                'amount' => (float) $tx->amount,
                'balance_after' => (float) $tx->balance_after,
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 422);
        }
    }

    public function withdrawCapital(WithdrawCapitalProfitWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new WithdrawCapitalProfitWalletReqModel($request);
            $tx = $this->profitWalletService->withdrawCapital($reqModel);

            return ResponseApi::make(true, trans('message.success.success'), [
                'transaction_id' => $tx->id,
                'amount' => (float) $tx->amount,
                'balance_after' => (float) $tx->balance_after,
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 422);
        }
    }
}
