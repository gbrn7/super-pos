<?php

namespace App\Http\Controllers;

use App\Support\Enums\PaymentMethodPermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PaymentMethodController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:' . PaymentMethodPermissionEnums::READ_PAYMENT_METHOD->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('payment-method/index');
    }
}
