<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Enums\DashboardPermissionEnums;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiDashboardController extends Controller implements HasMiddleware
{
    public function __construct(
        protected DashboardServiceInterface $dashboardService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.DashboardPermissionEnums::READ_DASHBOARD->value, only: ['index']),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $data = $this->dashboardService->getDashboardData($startDate, $endDate);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 500);
        }
    }
}
