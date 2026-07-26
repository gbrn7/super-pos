<?php

namespace App\Services;

use App\Support\Interfaces\Repositories\DashboardRepositoryInterface;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Utils\CheckException;
use Carbon\Carbon;

class DashboardService implements DashboardServiceInterface
{
    public function __construct(
        protected DashboardRepositoryInterface $dashboardRepository
    ) {}

    public function getDashboardData(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            // Default to this month (Bulan Ini) if not specified
            if (empty($startDate) || empty($endDate)) {
                $startDate = Carbon::now()->startOfMonth()->toDateString();
                $endDate = Carbon::now()->endOfMonth()->toDateString();
            }

            $metrics = $this->dashboardRepository->getMetrics($startDate, $endDate);
            $trendChart = $this->dashboardRepository->getTrendChart($startDate, $endDate);
            $topProducts = $this->dashboardRepository->getTopProducts($startDate, $endDate);
            $recentTransactions = $this->dashboardRepository->getRecentTransactions($startDate, $endDate);
            $lowStockProducts = $this->dashboardRepository->getLowStockProducts(10);

            // Format recent transactions
            $formattedTransactions = $recentTransactions->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'invoice_number' => $tx->invoice_number,
                    'user_name' => $tx->user ? $tx->user->name : '-',
                    'payment_method_name' => $tx->paymentMethod ? $tx->paymentMethod->name : '-',
                    'total_amount' => (float) $tx->total_amount,
                    'created_at' => $tx->created_at->toDateTimeString(),
                ];
            });

            return [
                'metrics' => $metrics,
                'trend_chart' => $trendChart,
                'top_products' => $topProducts,
                'recent_transactions' => $formattedTransactions,
                'low_stock_products' => $lowStockProducts->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'stock' => (int) $product->stock,
                        'price' => (float) $product->price,
                    ];
                }),
                'filter' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ];
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
