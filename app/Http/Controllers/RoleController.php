<?php

namespace App\Http\Controllers;

use App\Support\Enums\RolePermissionEnums;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class RoleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.RolePermissionEnums::READ_ROLE->value,
                only: ['index', 'show']
            ),
            new Middleware(
                'permission:'.RolePermissionEnums::CREATE_ROLE->value,
                only: ['create']
            ),
            new Middleware(
                'permission:'.RolePermissionEnums::UPDATE_ROLE->value,
                only: ['edit']
            ),
        ];
    }

    public function index()
    {
        return inertia('role/index');
    }

    public function create()
    {
        return inertia('role/create');
    }

    public function show(string $id)
    {
        return inertia('role/show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        return inertia('role/edit', ['id' => $id]);
    }
}
