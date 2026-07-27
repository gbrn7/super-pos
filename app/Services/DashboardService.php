<?php

namespace App\Services;

use App\Support\Interfaces\Repositories\DashboardRepositoryInterface;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Interfaces\Services\DashboardServiceInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use App\Support\Utils\CheckException;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardService implements DashboardServiceInterface
{
    public function __construct(
        protected DashboardRepositoryInterface $dashboardRepository,
        protected TransactionRepositoryInterface $transactionRepository,
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function getDashboardData(?string $startDate = null, ?string $endDate = null, int $txPage = 1, int $txLimit = 10, bool $onlyTransactions = false): array
    {
        try {
            // Default to this month (Bulan Ini) if not specified
            if (empty($startDate) || empty($endDate)) {
                $startDate = (string) Carbon::now()->startOfMonth()->startOfDay()->unix();
                $endDate = (string) Carbon::now()->endOfMonth()->endOfDay()->unix();
            }

            // Fetch recent transactions using TransactionRepository with server-side pagination
            $txRequest = new Request([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'page' => $txPage,
                'limit' => $txLimit,
            ]);
            $txReqModel = new GetTransactionReqModel($txRequest);
            $recentTransactionsPaginator = $this->transactionRepository->getAllByIndex($txReqModel);

            // Format recent transactions
            $formattedTransactions = collect($recentTransactionsPaginator->items())->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'invoice_number' => $tx->invoice_number,
                    'user_name' => $tx->user ? $tx->user->name : '-',
                    'payment_method_name' => $tx->paymentMethod ? $tx->paymentMethod->name : '-',
                    'total_amount' => (float) $tx->total_amount,
                    'created_at' => $tx->created_at->toDateTimeString(),
                ];
            });

            if ($onlyTransactions) {
                return [
                    'recent_transactions' => [
                        'data' => $formattedTransactions,
                        'total' => $recentTransactionsPaginator->total(),
                        'current_page' => $recentTransactionsPaginator->currentPage(),
                        'per_page' => $recentTransactionsPaginator->perPage(),
                        'last_page' => $recentTransactionsPaginator->lastPage(),
                    ],
                ];
            }

            $metrics = $this->dashboardRepository->getMetrics($startDate, $endDate);
            $metrics['total_products'] = $this->productRepository->getTotalProductsCount();
            $metrics['out_of_stock_products'] = $this->productRepository->getOutOfStockProductsCount();

            $trendChart = $this->dashboardRepository->getTrendChart($startDate, $endDate);
            $topProducts = $this->dashboardRepository->getTopProducts($startDate, $endDate);
            $lowStockProducts = $this->dashboardRepository->getLowStockProducts(50);
            $transactionsByPaymentMethod = $this->dashboardRepository->getTransactionsByPaymentMethod($startDate, $endDate);
            $transactionsByCategory = $this->dashboardRepository->getTransactionsByCategory($startDate, $endDate);

            // Retrieve best‑selling products via repository
            $bestSellers = $this->productRepository->getBestSellers(50)
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'price' => (float) $product->price,
                        'sold_quantity' => (int) $product->sold_quantity,
                    ];
                });

            return [
                'metrics' => $metrics,
                'trend_chart' => $trendChart,
                'top_products' => $topProducts,
                'recent_transactions' => [
                    'data' => $formattedTransactions,
                    'total' => $recentTransactionsPaginator->total(),
                    'current_page' => $recentTransactionsPaginator->currentPage(),
                    'per_page' => $recentTransactionsPaginator->perPage(),
                    'last_page' => $recentTransactionsPaginator->lastPage(),
                ],
                'transactions_by_payment_method' => $transactionsByPaymentMethod,
                'transactions_by_category' => $transactionsByCategory,
                'low_stock_products' => $lowStockProducts->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'stock' => (int) $product->stock,
                        'price' => (float) $product->price,
                    ];
                }),
                'best_sellers' => $bestSellers,
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
