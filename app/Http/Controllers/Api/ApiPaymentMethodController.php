<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentMethod\BulkDeletePaymentMethodRequest;
use App\Http\Requests\PaymentMethod\StorePaymentMethodRequest;
use App\Http\Requests\PaymentMethod\UpdatePaymentMethodRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Support\Enums\PaymentMethodPermissionEnums;
use App\Support\Interfaces\Services\PaymentMethodServiceInterface;
use App\Support\Models\PaymentMethod\GetPaymentMethodReqModel;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiPaymentMethodController extends Controller implements HasMiddleware
{
    public function __construct(protected PaymentMethodServiceInterface $paymentMethodService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . PaymentMethodPermissionEnums::READ_PAYMENT_METHOD->value,
                only: ['index', 'show']
            ),

            new Middleware(
                'permission:' . PaymentMethodPermissionEnums::CREATE_PAYMENT_METHOD->value,
                only: ['store']
            ),

            new Middleware(
                'permission:' . PaymentMethodPermissionEnums::UPDATE_PAYMENT_METHOD->value,
                only: ['update']
            ),

            new Middleware(
                'permission:' . PaymentMethodPermissionEnums::DELETE_PAYMENT_METHOD->value,
                only: ['destroy', 'bulkDelete']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $paymentMethods = $this->paymentMethodService->getAllByIndex(new GetPaymentMethodReqModel($request));

            $data = PaymentMethodResource::collection($paymentMethods);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {

            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentMethodRequest $request)
    {
        try {
            $paymentMethod = $this->paymentMethodService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), $paymentMethod, Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $data = $this->paymentMethodService->getById($id);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentMethodRequest $request, string $id)
    {
        try {
            $paymentMethod = $this->paymentMethodService->update($id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), $paymentMethod);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $isSuccessDelete = $this->paymentMethodService->delete($id);

            if (! $isSuccessDelete) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Bulk delete resources.
     */
    public function bulkDelete(BulkDeletePaymentMethodRequest $request)
    {
        try {
            $deletedCount = $this->paymentMethodService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }
}
