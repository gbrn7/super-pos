<?php

namespace App\Http\Controllers;

use App\Support\Enums\TransactionDetailPermissionEnums;
use App\Support\Interfaces\Services\TransactionDetailServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TransactionDetailController extends Controller implements HasMiddleware
{
    public function __construct(protected TransactionDetailServiceInterface $transactionDetailService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.TransactionDetailPermissionEnums::READ_TRANSACTION_DETAIL->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('transaction-detail/index');
    }
}
