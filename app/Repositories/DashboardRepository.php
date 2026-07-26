<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Support\Interfaces\Repositories\DashboardRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    private function parseStartTimestamp(string $startDate): int
    {
        return is_numeric($startDate)
            ? Carbon::createFromTimestamp((int) $startDate)->startOfDay()->getTimestamp()
            : Carbon::parse($startDate)->startOfDay()->getTimestamp();
    }

    private function parseEndTimestamp(string $endDate): int
    {
        return is_numeric($endDate)
            ? Carbon::createFromTimestamp((int) $endDate)->endOfDay()->getTimestamp()
            : Carbon::parse($endDate)->endOfDay()->getTimestamp();
    }

    public function getMetrics(string $startDate, string $endDate): array
    {
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        $stats = DB::table('transactions')
            ->leftJoin('transaction_detail', function ($join) {
                $join->on('transactions.id', '=', 'transaction_detail.transaction_id')
                    ->whereNull('transaction_detail.deleted_at');
            })
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->selectRaw('
                COUNT(DISTINCT transactions.id) as transactions_count,
                COALESCE(SUM(DISTINCT transactions.total_amount), 0) as total_revenue,
                COALESCE(SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)), 0) as total_net_profit,
                COALESCE(SUM(transaction_detail.quantity), 0) as products_sold
            ')
            ->first();

        return [
            'total_revenue' => (float) ($stats->total_revenue ?? 0),
            'total_net_profit' => (float) ($stats->total_net_profit ?? 0),
            'transactions_count' => (int) ($stats->transactions_count ?? 0),
            'products_sold' => (int) ($stats->products_sold ?? 0),
        ];
    }

    public function getTrendChart(string $startDate, string $endDate): Collection
    {
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        return Transaction::select(
            DB::raw("to_char(to_timestamp(transactions.created_at), 'YYYY-MM-DD') as date"),
            DB::raw('SUM(transactions.total_amount) as revenue'),
            DB::raw('SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)) as profit'),
            DB::raw('SUM(transaction_detail.quantity) as quantity')
        )
            ->join('transaction_detail', 'transactions.id', '=', 'transaction_detail.transaction_id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->groupBy(DB::raw("to_char(to_timestamp(transactions.created_at), 'YYYY-MM-DD')"))
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
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        return TransactionDetail::select(
            'products.name',
            DB::raw('SUM(transaction_detail.quantity) as quantity')
        )
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
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
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        return Transaction::with(['user', 'paymentMethod'])
            ->whereBetween('created_at', [$start, $end])
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
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        return Transaction::select(
            'payment_methods.name as payment_method_name',
            DB::raw('COUNT(transactions.id) as transactions_count'),
            DB::raw('SUM(transactions.total_amount) as total_amount')
        )
            ->join('payment_methods', 'transactions.payment_method_id', '=', 'payment_methods.id')
            ->whereBetween('transactions.created_at', [$start, $end])
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
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        return TransactionDetail::select(
            'categories.name as category_name',
            DB::raw('SUM(transaction_detail.quantity * transaction_detail.price) as total_amount'),
            DB::raw('SUM(transaction_detail.quantity) as products_count')
        )
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
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
