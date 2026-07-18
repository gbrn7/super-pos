<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionDetail\BulkDeleteTransactionDetailRequest;
use App\Http\Requests\TransactionDetail\StoreTransactionDetailRequest;
use App\Http\Requests\TransactionDetail\UpdateTransactionDetailRequest;
use App\Http\Resources\TransactionDetailResource;
use App\Support\Enums\TransactionDetailPermissionEnums;
use App\Support\Interfaces\Services\TransactionDetailServiceInterface;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiTransactionDetailController extends Controller implements HasMiddleware
{
    public function __construct(protected TransactionDetailServiceInterface $transactionDetailService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.TransactionDetailPermissionEnums::READ_TRANSACTION_DETAIL->value,
                only: ['index', 'show', 'getByTransactionId']
            ),
            new Middleware(
                'permission:'.TransactionDetailPermissionEnums::CREATE_TRANSACTION_DETAIL->value,
                only: ['store']
            ),
            new Middleware(
                'permission:'.TransactionDetailPermissionEnums::UPDATE_TRANSACTION_DETAIL->value,
                only: ['update']
            ),
            new Middleware(
                'permission:'.TransactionDetailPermissionEnums::DELETE_TRANSACTION_DETAIL->value,
                only: ['destroy', 'bulkDelete']
            ),
        ];
    }

    /**
     * Display a listing of transaction details.
     */
    public function index(Request $request)
    {
        try {
            $details = $this->transactionDetailService->getAllByIndex(new GetTransactionDetailReqModel($request));
            $data = TransactionDetailResource::collection($details);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Store a newly created transaction detail in storage.
     */
    public function store(StoreTransactionDetailRequest $request)
    {
        try {
            $detail = $this->transactionDetailService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), new TransactionDetailResource($detail), Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Display the specified transaction detail.
     */
    public function show(string $id)
    {
        try {
            $detail = $this->transactionDetailService->getById((int) $id);

            return ResponseApi::make(true, trans('message.success.success'), new TransactionDetailResource($detail));
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Display transaction details for a specific transaction ID.
     */
    public function getByTransactionId(int $transactionId)
    {
        try {
            $details = $this->transactionDetailService->getByTransactionId($transactionId);

            return ResponseApi::make(true, trans('message.success.success'), TransactionDetailResource::collection($details));
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Update the specified transaction detail in storage.
     */
    public function update(UpdateTransactionDetailRequest $request, string $id)
    {
        try {
            $detail = $this->transactionDetailService->update((int) $id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), new TransactionDetailResource($detail));
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Remove the specified transaction detail from storage.
     */
    public function destroy(string $id)
    {
        try {
            $isSuccessDelete = $this->transactionDetailService->delete((int) $id);

            if (! $isSuccessDelete) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }

    /**
     * Bulk delete transaction details.
     */
    public function bulkDelete(BulkDeleteTransactionDetailRequest $request)
    {
        try {
            $deletedCount = $this->transactionDetailService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getCode());
        }
    }
}
