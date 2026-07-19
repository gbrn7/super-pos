<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\BulkDeleteTransactionRequest;
use App\Http\Requests\Transaction\CheckoutRequest;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Support\Enums\TransactionPermissionEnums;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiTransactionController extends Controller implements HasMiddleware
{
    public function __construct(protected TransactionServiceInterface $transactionService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.TransactionPermissionEnums::READ_TRANSACTION->value,
                only: ['index', 'show', 'getByInvoiceNumber']
            ),
            new Middleware(
                'permission:'.TransactionPermissionEnums::CREATE_TRANSACTION->value,
                only: ['store', 'checkout']
            ),
            new Middleware(
                'permission:'.TransactionPermissionEnums::UPDATE_TRANSACTION->value,
                only: ['update']
            ),
            new Middleware(
                'permission:'.TransactionPermissionEnums::DELETE_TRANSACTION->value,
                only: ['destroy', 'bulkDelete']
            ),
        ];
    }

    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        try {
            $transactions = $this->transactionService->getAllByIndex(new GetTransactionReqModel($request));
            $data = TransactionResource::collection($transactions);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        try {
            $transaction = $this->transactionService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), new TransactionResource($transaction), Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(string $id)
    {
        try {
            $transaction = $this->transactionService->getById((int) $id);

            return ResponseApi::make(true, trans('message.success.success'), new TransactionResource($transaction));
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Display the specified transaction by invoice number.
     */
    public function getByInvoiceNumber(string $invoiceNumber)
    {
        try {
            $transaction = $this->transactionService->getByInvoiceNumber($invoiceNumber);

            return ResponseApi::make(true, trans('message.success.success'), new TransactionResource($transaction));
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(UpdateTransactionRequest $request, string $id)
    {
        try {
            $transaction = $this->transactionService->update((int) $id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), new TransactionResource($transaction));
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(string $id)
    {
        try {
            $isSuccessDelete = $this->transactionService->delete((int) $id);

            if (! $isSuccessDelete) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Bulk delete transactions.
     */
    public function bulkDelete(BulkDeleteTransactionRequest $request)
    {
        try {
            $deletedCount = $this->transactionService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Atomic checkout: create transaction + details + update stock.
     */
    public function checkout(CheckoutRequest $request)
    {
        try {
            $transaction = $this->transactionService->checkout($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), new TransactionResource($transaction), Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }
}
