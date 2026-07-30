<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductReturn\StoreProductReturnRequest;
use App\Http\Resources\ProductReturnResource;
use App\Support\Enums\ReturnPermissionEnums;
use App\Support\Interfaces\Services\ReturnServiceInterface;
use App\Support\Models\ProductReturn\GetProductReturnReqModel;
use App\Support\Utils\PaginationResource;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiReturnController extends Controller implements HasMiddleware
{
    public function __construct(protected ReturnServiceInterface $returnService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.ReturnPermissionEnums::READ_RETURN->value,
                only: ['index']
            ),
            new Middleware(
                'permission:'.ReturnPermissionEnums::CREATE_RETURN->value,
                only: ['store']
            ),
        ];
    }

    /**
     * Display a listing of returns.
     */
    public function index(Request $request)
    {
        try {
            $returns = $this->returnService->getAll(new GetProductReturnReqModel($request));

            $items = ProductReturnResource::collection($returns->items());
            $data = PaginationResource::make($items, $returns);

            return ResponseApi::make(true, trans('message.success.returns.success_get'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, (int) $th->getCode() ?: 500);
        }
    }

    /**
     * Store a newly created return in storage.
     */
    public function store(StoreProductReturnRequest $request)
    {
        try {
            $validated = $request->validated();

            $return = $this->returnService->processReturn(
                transactionId: (int) $validated['transaction_id'],
                items: $validated['items'],
                reason: $validated['reason'] ?? null,
                user: $request->user()
            );

            return ResponseApi::make(
                true,
                trans('message.success.returns.success_process'),
                $return,
                Response::HTTP_CREATED
            );
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, (int) $th->getCode() ?: 500);
        }
    }
}
