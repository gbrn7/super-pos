<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Model\Request\GetCategoryReqModel;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(protected CategoryServiceInterface $categoryService) {}

    public function Index(Request $request)
    {
        $categories = $this->categoryService->getAllByIndex(new GetCategoryReqModel($request), 1);

        if (!request()->inertia() && request()->wantsJson()) {
            return CategoryResource::collection($categories);
        }

        return inertia('category/index', [
            'categories' => $categories->jsonSerialize(),
        ]);
    }

    public function getAllCategories(Request $request)
    {
        $categories = $this->categoryService->getAllByIndex(new GetCategoryReqModel($request));

        return CategoryResource::collection($categories);
    }
}
