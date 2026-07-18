<?php

namespace App\Http\Controllers;

use App\Support\Enums\TransactionPermissionEnums;
use App\Support\Interfaces\Services\TransactionServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TransactionController extends Controller implements HasMiddleware
{
    public function __construct(protected TransactionServiceInterface $transactionService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.TransactionPermissionEnums::READ_TRANSACTION->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('transaction/index');
    }
}
