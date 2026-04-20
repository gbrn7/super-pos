<?php

namespace App\Http\Controllers;

use App\Support\Interfaces\Repositories\CategoryServiceInterface;
use App\Support\Model\Request\GetCategoryReqModel;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
  public function __construct(protected CategoryServiceInterface $categoryService) {}

  public function Index(Request $request)
  {
    $categories = $this->categoryService->getAllByIndex(new GetCategoryReqModel($request));

    if (!request()->inertia() && request()->wantsJson()) {
      return response()->json($categories);
    }

    return inertia('Category/Index', [
      'categories' => $categories,
    ]);
  }
}
