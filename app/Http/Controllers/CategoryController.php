<?php

namespace App\Http\Controllers;

use App\Support\Enums\CategoryPermissionEnums;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CategoryController extends Controller implements HasMiddleware
{
    public function __construct(protected CategoryServiceInterface $categoryService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . CategoryPermissionEnums::READ_CATEGORY->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('category/index');
    }
}
