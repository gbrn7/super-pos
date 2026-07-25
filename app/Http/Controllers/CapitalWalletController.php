<?php

namespace App\Http\Controllers;

use App\Support\Enums\CapitalWalletPermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class CapitalWalletController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.CapitalWalletPermissionEnums::READ_CAPITAL_WALLET->value,
                only: ['index']
            ),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('capital-wallet/index');
    }
}
