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
            ? (int) $startDate
            : Carbon::parse($startDate)->startOfDay()->unix();
    }

    private function parseEndTimestamp(string $endDate): int
    {
        return is_numeric($endDate)
            ? (int) $endDate
            : Carbon::parse($endDate)->endOfDay()->unix();
    }

    public function getMetrics(string $startDate, string $endDate): array
    {
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        $txStats = DB::table('transactions')
            ->whereBetween('created_at', [$start, $end])
            ->whereNull('deleted_at')
            ->selectRaw('
                COUNT(id) as transactions_count,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(discount_amount), 0) as total_transaction_discount
            ')
            ->first();

        $detailStats = DB::table('transaction_detail')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->whereNull('transaction_detail.deleted_at')
            ->selectRaw('
                COALESCE(SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.cost_price)), 0) as total_net_profit,
                COALESCE(SUM(transaction_detail.quantity * transaction_detail.cost_price), 0) as total_cost,
                COALESCE(SUM(transaction_detail.discount), 0) as total_detail_discount,
                COALESCE(SUM(transaction_detail.quantity), 0) as products_sold
            ')
            ->first();

        // Calculate returns
        $totalRefund = (float) DB::table('returns')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_refund_amount');

        $returnDetailsStats = DB::table('return_details')
            ->join('returns', 'return_details.return_id', '=', 'returns.id')
            ->join('transaction_detail', function ($join) {
                $join->on('returns.transaction_id', '=', 'transaction_detail.transaction_id')
                    ->on('return_details.product_id', '=', 'transaction_detail.product_id');
            })
            ->whereBetween('returns.created_at', [$start, $end])
            ->selectRaw('
                COALESCE(SUM(return_details.quantity), 0) as returned_qty,
                COALESCE(SUM(return_details.quantity * transaction_detail.cost_price), 0) as returned_cost
            ')
            ->first();

        $totalRevenue = (float) ($txStats->total_revenue ?? 0) - $totalRefund;
        $totalCost = (float) ($detailStats->total_cost ?? 0) - (float) ($returnDetailsStats->returned_cost ?? 0);
        $totalProfit = $totalRevenue - $totalCost;
        $totalDiscount = (float) ($txStats->total_transaction_discount ?? 0) + (float) ($detailStats->total_detail_discount ?? 0);
        $productsSold = (int) ($detailStats->products_sold ?? 0) - (int) ($returnDetailsStats->returned_qty ?? 0);

        return [
            'total_revenue' => $totalRevenue,
            'total_net_profit' => $totalProfit,
            'transactions_count' => (int) ($txStats->transactions_count ?? 0),
            'products_sold' => $productsSold,
            'revenue_breakdown' => [
                'profit' => $totalProfit,
                'cost' => $totalCost,
                'discount' => $totalDiscount,
            ],
        ];
    }

    public function getTrendChart(string $startDate, string $endDate): Collection
    {
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        $detailSubquery = DB::table('transaction_detail')
            ->whereNull('deleted_at')
            ->select(
                'transaction_id',
                DB::raw('SUM(quantity * cost_price) as cost'),
                DB::raw('SUM(quantity) as quantity')
            )
            ->groupBy('transaction_id');

        return DB::table('transactions')
            ->leftJoinSub($detailSubquery, 'details', function ($join) {
                $join->on('transactions.id', '=', 'details.transaction_id');
            })
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->select(
                DB::raw("to_char(to_timestamp(transactions.created_at), 'YYYY-MM-DD') as date"),
                DB::raw('COALESCE(SUM(transactions.total_amount), 0) as revenue'),
                DB::raw('COALESCE(SUM(details.cost), 0) as cost'),
                DB::raw('COALESCE(SUM(details.quantity), 0) as quantity')
            )
            ->groupBy(DB::raw("to_char(to_timestamp(transactions.created_at), 'YYYY-MM-DD')"))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                $revenue = (float) $item->revenue;
                $cost = (float) $item->cost;

                return [
                    'date' => $item->date,
                    'revenue' => $revenue,
                    'profit' => $revenue - $cost,
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
            DB::raw('SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.discount)) as total_amount'),
            DB::raw('SUM(transaction_detail.quantity) as products_count')
        )
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->whereNull('transaction_detail.deleted_at')
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
