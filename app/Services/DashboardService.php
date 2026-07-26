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
                $startDate = Carbon::now()->startOfMonth()->toDateString();
                $endDate = Carbon::now()->endOfMonth()->toDateString();
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

            $rawTransactions = $this->transactionRepository->getTransactionsForDashboard($startDate, $endDate);

            $totalRevenue = 0;
            $totalNetProfit = 0;
            $productsSold = 0;
            $transactionsCount = $rawTransactions->count();

            $trendData = [];
            $paymentMethodData = [];
            $categoryData = [];
            $productSalesCount = [];

            foreach ($rawTransactions as $tx) {
                $totalRevenue += (float) $tx->total_amount;
                $dateStr = Carbon::createFromTimestamp((int) $tx->created_at)->toDateString();

                if (! isset($trendData[$dateStr])) {
                    $trendData[$dateStr] = ['date' => $dateStr, 'revenue' => 0.0, 'profit' => 0.0, 'quantity' => 0];
                }
                $trendData[$dateStr]['revenue'] += (float) $tx->total_amount;

                $pmName = $tx->paymentMethod ? $tx->paymentMethod->name : 'Unknown';
                if (! isset($paymentMethodData[$pmName])) {
                    $paymentMethodData[$pmName] = ['payment_method_name' => $pmName, 'transactions_count' => 0, 'total_amount' => 0.0];
                }
                $paymentMethodData[$pmName]['transactions_count']++;
                $paymentMethodData[$pmName]['total_amount'] += (float) $tx->total_amount;

                foreach ($tx->transactionDetails as $detail) {
                    $qty = (int) $detail->quantity;
                    $profit = $qty * ((float) $detail->price - (float) $detail->cost_price);

                    $productsSold += $qty;
                    $totalNetProfit += $profit;

                    $trendData[$dateStr]['profit'] += $profit;
                    $trendData[$dateStr]['quantity'] += $qty;

                    if ($detail->product) {
                        $pName = $detail->product->name;
                        if (! isset($productSalesCount[$pName])) {
                            $productSalesCount[$pName] = 0;
                        }
                        $productSalesCount[$pName] += $qty;

                        if ($detail->product->category) {
                            $catName = $detail->product->category->name;
                            if (! isset($categoryData[$catName])) {
                                $categoryData[$catName] = ['category_name' => $catName, 'total_amount' => 0.0, 'products_count' => 0];
                            }
                            $categoryData[$catName]['total_amount'] += $qty * (float) $detail->price;
                            $categoryData[$catName]['products_count'] += $qty;
                        }
                    }
                }
            }

            ksort($trendData);
            arsort($productSalesCount);

            $topProducts = collect($productSalesCount)->take(5)->map(fn ($qty, $name) => [
                'name' => $name,
                'quantity' => $qty,
            ])->values();

            $metrics = [
                'total_revenue' => (float) $totalRevenue,
                'total_net_profit' => (float) $totalNetProfit,
                'transactions_count' => (int) $transactionsCount,
                'products_sold' => (int) $productsSold,
                'total_products' => $this->productRepository->getTotalProductsCount(),
                'out_of_stock_products' => $this->productRepository->getOutOfStockProductsCount(),
            ];

            $lowStockProducts = $this->dashboardRepository->getLowStockProducts(50);
            $bestSellers = $this->productRepository->getBestSellers(50)
                ->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => (float) $product->price,
                    'sold_quantity' => (int) $product->sold_quantity,
                ]);

            return [
                'metrics' => $metrics,
                'trend_chart' => collect(array_values($trendData)),
                'top_products' => $topProducts,
                'recent_transactions' => [
                    'data' => $formattedTransactions,
                    'total' => $recentTransactionsPaginator->total(),
                    'current_page' => $recentTransactionsPaginator->currentPage(),
                    'per_page' => $recentTransactionsPaginator->perPage(),
                    'last_page' => $recentTransactionsPaginator->lastPage(),
                ],
                'transactions_by_payment_method' => collect(array_values($paymentMethodData)),
                'transactions_by_category' => collect(array_values($categoryData)),
                'low_stock_products' => $lowStockProducts->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'stock' => (int) $product->stock,
                    'price' => (float) $product->price,
                ]),
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
