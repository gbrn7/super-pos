<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\ImportCategoryRequest;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Models\Category\GetCategoryReqModel;
use App\Support\Utils\MessageResponse;
use App\Support\Utils\ResponseApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ApiCategoryController extends Controller
{
    public function __construct(protected CategoryServiceInterface $categoryService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $categories = $this->categoryService->getAllByIndex(new GetCategoryReqModel($request));

            $data = CategoryResource::collection($categories);


            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            //make log for error
            return ResponseApi::make(false, trans('message.error.something_went_wrong'), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        try {
            $category = $this->categoryService->create($request->validated());

            return ResponseApi::make(true, trans('message.success.created'), $category, Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, trans('message.error.something_went_wrong'), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, string $id)
    {
        try {
            $category = $this->categoryService->update($id, $request->validated());

            return ResponseApi::make(true, trans('message.success.updated'), $category);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, trans('message.error.something_went_wrong'), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $isSuccessDelete = $this->categoryService->delete($id);

            if (!$isSuccessDelete) throw new Exception();

            return ResponseApi::make(true, trans('message.success.deleted'), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            dd($th->getMessage());
            return ResponseApi::make(false, trans('message.error.something_went_wrong'), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bulk delete resources.
     */
    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            $deletedCount = $this->categoryService->bulkDelete($ids);

            return ResponseApi::make(true, trans('message.success.bulk_deleted', ['count' => $deletedCount]), null, Response::HTTP_OK);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, trans('message.error.something_went_wrong'), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getCategoryImportTemplate()
    {
        $fileName = 'import-category-template.xlsx';
        $publiFilePath = 'template/' . $fileName;

        if (!file_exists($publiFilePath)) {
            return ResponseApi::make(false, trans('message.error.not_found', ['resource' => 'file']), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return ResponseApi::download($fileName, $publiFilePath);
    }

    public function importCategoryExcelData(ImportCategoryRequest $request)
    {
        try {
            $file = $request->validated('file_import');

            $createdCount = $this->categoryService->importExcel($file);

            return ResponseApi::make(true, trans('message.success.bulk_created', ["count" => $createdCount]), null, Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, trans('message.error.something_went_wrong'), null, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
