<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class ApiDashboardController extends Controller implements HasMiddleware
{
    public function __construct(
        protected DashboardServiceInterface $dashboardService
    ) {}

    public static function middleware(): array
    {
        return [];
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $txPage = $request->query('tx_page') ? (int) $request->query('tx_page') : 1;
            $txLimit = $request->query('tx_limit') ? (int) $request->query('tx_limit') : 10;
            $onlyTransactions = $request->query('only_transactions') === 'true';

            $data = $this->dashboardService->getDashboardData($startDate, $endDate, $txPage, $txLimit, $onlyTransactions);

            return ResponseApi::make(true, trans('message.success.success'), $data);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 500);
        }
    }
}
