<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Models\Category\GetCategoryReqModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApiCategoryController extends Controller
{
    public function __construct(protected CategoryServiceInterface $categoryService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $categories = $this->categoryService->getAllByIndex(new GetCategoryReqModel($request));

        return CategoryResource::collection($categories);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $category = $this->categoryService->create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category,
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error' => $th->getMessage(),
            ], 500);
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
    public function update(Request $request, string $id)
    {
        try {
            $category = $this->categoryService->update($id, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category,
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $category = $this->categoryService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category,
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error' => $th->getMessage(),
            ], 500);
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

            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} categories deleted successfully",
                'data' => ['deleted_count' => $deletedCount],
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function getCategoryImportTemplate()
    {
        $fileName = 'import-category-template.xlsx';
        $filePath = 'template/' . $fileName;

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => "File not found.",
            ], 404);
        }

        return response()->download(
            public_path($filePath),
            $fileName,
            [
                'Content-Type'        => mime_content_type($filePath),
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]
        );
    }

    public function importStudentExcelData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file_import' => 'required|mimes:xlsx',
        ]);

        if ($validator->fails()) return redirect()
            ->back()
            ->withInput()
            ->with('toast_error', join(', ', $validator->messages()->all()));

        try {
            $data = $validator->safe()->all();

            $file = $data['file_import'];

            $this->categoryService->importExcel($file);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => "",
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
}
