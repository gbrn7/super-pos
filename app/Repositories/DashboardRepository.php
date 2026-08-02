<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\Transaction;
use App\Support\Interfaces\Repositories\DashboardRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    private function parseStartTimestamp(string $startDate): Carbon
    {
        return is_numeric($startDate)
            ? Carbon::createFromTimestamp((int) $startDate)->startOfDay()
            : Carbon::parse($startDate)->startOfDay();
    }

    private function parseEndTimestamp(string $endDate): Carbon
    {
        return is_numeric($endDate)
            ? Carbon::createFromTimestamp((int) $endDate)->endOfDay()
            : Carbon::parse($endDate)->endOfDay();
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

        $txData = DB::table('transactions')
            ->leftJoinSub($detailSubquery, 'details', function ($join) {
                $join->on('transactions.id', '=', 'details.transaction_id');
            })
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->select(
                DB::raw("to_char(transactions.created_at, 'YYYY-MM-DD') as date"),
                DB::raw('COALESCE(SUM(transactions.total_amount), 0) as revenue'),
                DB::raw('COALESCE(SUM(details.cost), 0) as cost'),
                DB::raw('COALESCE(SUM(details.quantity), 0) as quantity')
            )
            ->groupBy(DB::raw("to_char(transactions.created_at, 'YYYY-MM-DD')"))
            ->get();

        $returnData = DB::table('returns')
            ->join('return_details', 'returns.id', '=', 'return_details.return_id')
            ->join('transaction_detail', function ($join) {
                $join->on('returns.transaction_id', '=', 'transaction_detail.transaction_id')
                    ->on('return_details.product_id', '=', 'transaction_detail.product_id');
            })
            ->whereBetween('returns.created_at', [$start, $end])
            ->select(
                DB::raw("to_char(returns.created_at, 'YYYY-MM-DD') as date"),
                DB::raw('COALESCE(SUM(returns.total_refund_amount), 0) as refund'),
                DB::raw('COALESCE(SUM(return_details.quantity * transaction_detail.cost_price), 0) as returned_cost'),
                DB::raw('COALESCE(SUM(return_details.quantity), 0) as returned_qty')
            )
            ->groupBy(DB::raw("to_char(returns.created_at, 'YYYY-MM-DD')"))
            ->get()
            ->keyBy('date');

        $allDates = $txData->pluck('date')->merge($returnData->keys())->unique()->sort()->values();
        $txDataMap = $txData->keyBy('date');

        return $allDates->map(function ($date) use ($txDataMap, $returnData) {
            $tx = $txDataMap->get($date);
            $ret = $returnData->get($date);

            $txRevenue = $tx ? (float) $tx->revenue : 0.0;
            $txCost = $tx ? (float) $tx->cost : 0.0;
            $txQty = $tx ? (int) $tx->quantity : 0;

            $retRefund = $ret ? (float) $ret->refund : 0.0;
            $retCost = $ret ? (float) $ret->returned_cost : 0.0;
            $retQty = $ret ? (int) $ret->returned_qty : 0;

            $revenue = $txRevenue - $retRefund;
            $cost = $txCost - $retCost;

            return [
                'date' => $date,
                'revenue' => $revenue,
                'profit' => $revenue - $cost,
                'quantity' => $txQty - $retQty,
            ];
        });
    }

    public function getTopProducts(string $startDate, string $endDate, int $limit = 5): Collection
    {
        $start = $this->parseStartTimestamp($startDate);
        $end = $this->parseEndTimestamp($endDate);

        $sales = DB::table('transaction_detail')
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->whereNull('transaction_detail.deleted_at')
            ->select('transaction_detail.product_id', 'products.name', DB::raw('SUM(transaction_detail.quantity) as qty'))
            ->groupBy('transaction_detail.product_id', 'products.name');

        $returns = DB::table('return_details')
            ->join('returns', 'return_details.return_id', '=', 'returns.id')
            ->whereBetween('returns.created_at', [$start, $end])
            ->select('return_details.product_id', DB::raw('SUM(return_details.quantity) as qty'))
            ->groupBy('return_details.product_id');

        return DB::table('products')
            ->joinSub($sales, 's', 'products.id', '=', 's.product_id')
            ->leftJoinSub($returns, 'r', 'products.id', '=', 'r.product_id')
            ->select('s.name', DB::raw('(s.qty - COALESCE(r.qty, 0)) as quantity'))
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

        $sales = DB::table('transactions')
            ->whereBetween('created_at', [$start, $end])
            ->whereNull('deleted_at')
            ->select('payment_method_id', DB::raw('COUNT(id) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method_id');

        $returns = DB::table('returns')
            ->join('transactions', 'returns.transaction_id', '=', 'transactions.id')
            ->whereBetween('returns.created_at', [$start, $end])
            ->select('transactions.payment_method_id', DB::raw('SUM(returns.total_refund_amount) as refund'))
            ->groupBy('transactions.payment_method_id');

        return DB::table('payment_methods')
            ->joinSub($sales, 's', 'payment_methods.id', '=', 's.payment_method_id')
            ->leftJoinSub($returns, 'r', 'payment_methods.id', '=', 'r.payment_method_id')
            ->select('payment_methods.name as payment_method_name', 's.count as transactions_count', DB::raw('(s.total - COALESCE(r.refund, 0)) as total_amount'))
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

        $sales = DB::table('transaction_detail')
            ->join('products', 'transaction_detail.product_id', '=', 'products.id')
            ->join('transactions', 'transaction_detail.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->whereNull('transactions.deleted_at')
            ->whereNull('transaction_detail.deleted_at')
            ->select('products.category_id', DB::raw('SUM(transaction_detail.quantity * (transaction_detail.price - transaction_detail.discount)) as total'), DB::raw('SUM(transaction_detail.quantity) as qty'))
            ->groupBy('products.category_id');

        $returns = DB::table('return_details')
            ->join('returns', 'return_details.return_id', '=', 'returns.id')
            ->join('products', 'return_details.product_id', '=', 'products.id')
            ->whereBetween('returns.created_at', [$start, $end])
            ->select('products.category_id', DB::raw('SUM(return_details.subtotal) as refund'), DB::raw('SUM(return_details.quantity) as qty'))
            ->groupBy('products.category_id');

        return DB::table('categories')
            ->joinSub($sales, 's', 'categories.id', '=', 's.category_id')
            ->leftJoinSub($returns, 'r', 'categories.id', '=', 'r.category_id')
            ->select('categories.name as category_name', DB::raw('(s.total - COALESCE(r.refund, 0)) as total_amount'), DB::raw('(s.qty - COALESCE(r.qty, 0)) as products_count'))
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
