<?php

namespace App\Http\Controllers;

use App\Support\Enums\ProductPermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProductController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.ProductPermissionEnums::READ_PRODUCT->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('product/index');
    }
}
