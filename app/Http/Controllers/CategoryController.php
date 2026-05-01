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
        return inertia('category/index');
    }
}
