<?php

namespace App\Http\Controllers;

use App\Support\Enums\ReturnPermissionEnums;
use App\Support\Interfaces\Services\ReturnServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller implements HasMiddleware
{
    public function __construct(protected ReturnServiceInterface $returnService) {}

    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.ReturnPermissionEnums::READ_RETURN->value,
                only: ['index']
            ),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('returns/index');
    }
}
