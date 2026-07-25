<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CapitalWallet\DrawdownCapitalWalletRequest;
use App\Http\Requests\CapitalWallet\IndexCapitalWalletRequest;
use App\Http\Requests\CapitalWallet\InjectCapitalWalletRequest;
use App\Http\Requests\CapitalWallet\PurchaseProductCapitalWalletRequest;
use App\Http\Resources\CapitalWalletTransactionResource;
use App\Support\Enums\CapitalWalletPermissionEnums;
use App\Support\Interfaces\Services\CapitalWalletServiceInterface;
use App\Support\Models\CapitalWallet\DrawdownCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\GetCapitalWalletTransactionReqModel;
use App\Support\Models\CapitalWallet\InjectCapitalWalletReqModel;
use App\Support\Models\CapitalWallet\PurchaseProductCapitalWalletReqModel;
use App\Support\Utils\PaginationResource;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiCapitalWalletController extends Controller implements HasMiddleware
{
    public function __construct(
        protected CapitalWalletServiceInterface $capitalWalletService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.CapitalWalletPermissionEnums::READ_CAPITAL_WALLET->value, only: ['index']),
            new Middleware('permission:'.CapitalWalletPermissionEnums::INJECT_CAPITAL_WALLET->value, only: ['inject']),
            new Middleware('permission:'.CapitalWalletPermissionEnums::DRAWDOWN_CAPITAL_WALLET->value, only: ['drawdown']),
            new Middleware('permission:'.CapitalWalletPermissionEnums::PURCHASE_PRODUCT_CAPITAL_WALLET->value, only: ['purchaseProduct']),
        ];
    }

    public function index(IndexCapitalWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new GetCapitalWalletTransactionReqModel($request);

            $summary = $this->capitalWalletService->getTransactionSummary($reqModel);
            $paginated = $this->capitalWalletService->getTransactions($reqModel);

            $items = CapitalWalletTransactionResource::collection($paginated->items());
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

    public function inject(InjectCapitalWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new InjectCapitalWalletReqModel($request);
            $tx = $this->capitalWalletService->inject($reqModel);

            return ResponseApi::make(true, trans('message.success.success'), [
                'transaction_id' => $tx->id,
                'amount' => (float) $tx->amount,
                'balance_after' => (float) $tx->balance_after,
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 422);
        }
    }

    public function drawdown(DrawdownCapitalWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new DrawdownCapitalWalletReqModel($request);
            $tx = $this->capitalWalletService->drawdown($reqModel);

            return ResponseApi::make(true, trans('message.success.success'), [
                'transaction_id' => $tx->id,
                'amount' => (float) $tx->amount,
                'balance_after' => (float) $tx->balance_after,
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 422);
        }
    }

    public function purchaseProduct(PurchaseProductCapitalWalletRequest $request): JsonResponse
    {
        try {
            $reqModel = new PurchaseProductCapitalWalletReqModel($request);
            $tx = $this->capitalWalletService->purchaseProduct($reqModel);

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
