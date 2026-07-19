<?php

namespace App\Http\Controllers;

use App\Support\Enums\TransactionPermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CashierController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.TransactionPermissionEnums::CREATE_TRANSACTION->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('cashier/index');
    }
}
