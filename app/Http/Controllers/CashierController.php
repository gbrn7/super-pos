<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
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
        $storeSetting = StoreSetting::first() ?? new StoreSetting([
            'name' => 'Toko Maju Jaya',
            'address' => 'Jl. Raya Bekasi KM.18 RT.004/0009, Jakarta Timur, 13250',
            'phone' => '081234567890',
            'email' => 'contact@majujaya.com',
        ]);

        return inertia('cashier/index', [
            'storeSetting' => $storeSetting,
        ]);
    }
}
