<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterProduct\BulkDeleteMasterProductRequest;
use App\Http\Requests\MasterProduct\ImportMasterProductRequest;
use App\Http\Requests\MasterProduct\StoreMasterProductRequest;
use App\Http\Requests\MasterProduct\UpdateMasterProductRequest;
use App\Http\Resources\MasterProductResource;
use App\Support\Enums\MasterProductPermissionEnums;
use App\Support\Interfaces\Services\MasterProductServiceInterface;
use App\Support\Models\MasterProduct\GetMasterProductReqModel;
use App\Support\Utils\PaginationResource;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class ApiMasterProductController extends Controller implements HasMiddleware
{
    public function __construct(protected MasterProductServiceInterface $MasterProductService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . MasterProductPermissionEnums::READ_MASTER_PRODUCT->value,
                only: ['index', 'show', 'getByBarcode', 'exportMasterProductExcelData', 'exportMasterProductPdfData']
            ),

            new Middleware(
                'permission:' . MasterProductPermissionEnums::CREATE_MASTER_PRODUCT->value,
                only: ['store', 'getMasterProductImportTemplate', 'importMasterProductExcelData']
            ),

            new Middleware(
                'permission:' . MasterProductPermissionEnums::UPDATE_MASTER_PRODUCT->value,
                only: ['update']
            ),

            new Middleware(
                'permission:' . MasterProductPermissionEnums::DELETE_MASTER_PRODUCT->value,
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
            $Masterproducts = $this->MasterProductService->getAllByIndex(new GetMasterProductReqModel($request));


            if ($Masterproducts instanceof Paginator) {
                $items = MasterProductResource::collection($Masterproducts->items());

                $data = PaginationResource::make($items, $Masterproducts);
            } else {
                $data = MasterProductResource::collection($Masterproducts);
            }

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMasterProductRequest $request)
    {
        try {
            $Masterproduct = $this->MasterProductService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), $Masterproduct, Response::HTTP_CREATED);
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
            $data = $this->MasterProductService->getById($id);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Display the specified resource by barcode.
     */
    public function getByBarcode(string $barcode)
    {
        try {
            $masterProduct = $this->MasterProductService->getByBarcode($barcode);

            $data = new MasterProductResource($masterProduct);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMasterProductRequest $request, string $id)
    {
        try {
            $Masterproduct = $this->MasterProductService->update($id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), $Masterproduct);
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
            $isSuccessDelete = $this->MasterProductService->delete($id);

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
    public function bulkDelete(BulkDeleteMasterProductRequest $request)
    {
        try {
            $deletedCount = $this->MasterProductService->bulkDelete($request->validated('ids'));

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    public function getMasterProductImportTemplate()
    {
        $fileName = 'import-master-products-template.xlsx';
        $publiFilePath = 'template/' . $fileName;

        if (! file_exists($publiFilePath)) {
            return ResponseApi::make(false, trans('message.error.not_found', ['resource' => 'file']), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return ResponseApi::download($fileName, $publiFilePath);
    }

    public function importMasterProductExcelData(ImportMasterProductRequest $request)
    {
        try {
            $file = $request->validated('file_import');

            $createdCount = $this->MasterProductService->importExcel($file);

            return ResponseApi::make(true, trans('message.success.bulk_created', ['count' => $createdCount]), null, Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    public function exportMasterProductExcelData()
    {
        try {
            return $this->MasterProductService->exportExcel();
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }

    public function exportMasterProductPdfData()
    {
        try {
            return $this->MasterProductService->exportPdf();
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, $th->getcode());
        }
    }
}
