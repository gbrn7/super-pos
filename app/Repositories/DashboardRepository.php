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
            DB::raw('SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)) as profit'),
            DB::raw('SUM(transaction_detail.quantity) as quantity')
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
                    'quantity' => (int) $item->quantity,
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

    public function getTransactionsByPaymentMethod(string $startDate, string $endDate): Collection
    {
        return Transaction::select(
            'payment_methods.name as payment_method_name',
            DB::raw('COUNT(transactions.id) as transactions_count'),
            DB::raw('SUM(transactions.total_amount) as total_amount')
        )
            ->join('payment_methods', 'transactions.payment_method_id', '=', 'payment_methods.id')
            ->whereBetween('transactions.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupBy('transactions.payment_method_id', 'payment_methods.name')
            ->get()
            ->map(function ($item) {
                return [
                    'payment_method_name' => $item->payment_method_name,
                    'transactions_count' => (int) $item->transactions_count,
                    'total_amount' => (float) $item->total_amount,
                ];
            });
    }

    public function getTransactionsByCategory(string $startDate, string $endDate): Collection
    {
        return TransactionDetail::select(
            'categories.name as category_name',
            DB::raw('SUM(transaction_detail.quantity * transaction_detail.price) as total_amount'),
            DB::raw('SUM(transaction_detail.quantity) as products_count')
        )
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupBy('products.category_id', 'categories.name')
            ->get()
            ->map(function ($item) {
                return [
                    'category_name' => $item->category_name,
                    'total_amount' => (float) $item->total_amount,
                    'products_count' => (int) $item->products_count,
                ];
            });
    }
}
