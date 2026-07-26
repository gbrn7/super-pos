<?php

namespace App\Http\Controllers;

use App\Support\Enums\ProfitWalletPermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class ProfitWalletController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.ProfitWalletPermissionEnums::READ_PROFIT_WALLET->value,
                only: ['index']
            ),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('profit-wallet/index');
    }
}
