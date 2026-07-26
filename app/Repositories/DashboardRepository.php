<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Support\Interfaces\Repositories\DashboardRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function getMetrics(string $startDate, string $endDate): array
    {
        $revenue = Transaction::whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->sum('total_amount');

        $transactionsCount = Transaction::whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->count();

        $detailsQuery = TransactionDetail::join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);

        $netProfit = $detailsQuery->sum(DB::raw('transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)'));
        $productsSold = $detailsQuery->sum('transaction_detail.quantity');

        return [
            'total_revenue' => (float) $revenue,
            'total_net_profit' => (float) $netProfit,
            'transactions_count' => (int) $transactionsCount,
            'products_sold' => (int) $productsSold,
        ];
    }

    public function getTrendChart(string $startDate, string $endDate): Collection
    {
        return Transaction::select(
            DB::raw('DATE(transactions.created_at) as date'),
            DB::raw('SUM(transactions.total_amount) as revenue'),
            DB::raw('SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)) as profit')
        )
            ->join('transaction_detail', 'transactions.id', '=', 'transaction_detail.transaction_id')
            ->whereBetween('transactions.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupBy(DB::raw('DATE(transactions.created_at)'))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'revenue' => (float) $item->revenue,
                    'profit' => (float) $item->profit,
                ];
            });
    }

    public function getTopProducts(string $startDate, string $endDate, int $limit = 5): Collection
    {
        return TransactionDetail::select(
            'products.name',
            DB::raw('SUM(transaction_detail.quantity) as quantity')
        )
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupBy('transaction_detail.product_id', 'products.name')
            ->orderBy('quantity', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'quantity' => (int) $item->quantity,
                ];
            });
    }

    public function getRecentTransactions(string $startDate, string $endDate, int $limit = 10): Collection
    {
        return Transaction::with(['user', 'paymentMethod'])
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getLowStockProducts(int $limit = 10): Collection
    {
        return Product::where('is_unlimited', false)
            ->orderBy('stock', 'asc')
            ->limit($limit)
            ->get();
    }
}
