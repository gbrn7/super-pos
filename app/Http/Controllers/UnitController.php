<?php

namespace App\Http\Controllers;

use App\Support\Enums\UnitPermissionEnums;
use App\Support\Interfaces\Services\UnitServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UnitController extends Controller implements HasMiddleware
{
    public function __construct(protected UnitServiceInterface $unitService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.UnitPermissionEnums::READ_UNIT->value,
                only: ['index']
            ),
        ];
    }

    public function index()
    {
        return inertia('unit/index');
    }
}
