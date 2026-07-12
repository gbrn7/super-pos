<?php

namespace App\Http\Controllers;

use App\Support\Enums\MasterProductPermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MasterProductController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.MasterProductPermissionEnums::READ_MASTER_PRODUCT->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('master-product/index');
    }
}
