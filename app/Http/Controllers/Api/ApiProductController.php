<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\BulkDeleteProductRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Support\Enums\ProductPermissionEnums;
use App\Support\Interfaces\Services\ProductServiceInterface;
use App\Support\Models\Product\GetProductReqModel;
use App\Support\Utils\PaginationResource;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiProductController extends Controller implements HasMiddleware
{
    public function __construct(protected ProductServiceInterface $productService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . ProductPermissionEnums::READ_PRODUCT->value,
                only: ['index', 'show']
            ),

            new Middleware(
                'permission:' . ProductPermissionEnums::CREATE_PRODUCT->value,
                only: ['store']
            ),

            new Middleware(
                'permission:' . ProductPermissionEnums::UPDATE_PRODUCT->value,
                only: ['update']
            ),

            new Middleware(
                'permission:' . ProductPermissionEnums::DELETE_PRODUCT->value,
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
            $products = $this->productService->getAllByIndex(new GetProductReqModel($request));

            $items = ProductResource::collection($products->items());

            $data = PaginationResource::make($items, $products);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        try {
            $product = $this->productService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), $product, Response::HTTP_CREATED);
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
            $data = $this->productService->getById($id);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, string $id)
    {
        try {
            $product = $this->productService->update($id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), $product);
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
            $isSuccessDelete = $this->productService->delete($id);

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
    public function bulkDelete(BulkDeleteProductRequest $request)
    {
        try {
            $deletedCount = $this->productService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }
}
