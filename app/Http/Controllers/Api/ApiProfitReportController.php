<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransactionProfit;
use App\Support\Enums\TransactionPermissionEnums;
use App\Support\Utils\ResponseApi;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApiProfitReportController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                'permission:'.TransactionPermissionEnums::READ_TRANSACTION_PROFIT->value,
                only: ['index']
            ),
        ];
    }

    public function index(Request $request)
    {
        try {
            $query = TransactionProfit::query()
                ->with(['transaction.user', 'transaction.paymentMethod']);

            // Filter by Date Range
            if ($request->filled('start_date')) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->whereDate('created_at', '>=', $request->start_date);
                });
            }
            if ($request->filled('end_date')) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->whereDate('created_at', '<=', $request->end_date);
                });
            }

            // Filter by User/Cashier
            if ($request->filled('user_id')) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->where('user_id', $request->user_id);
                });
            }

            // Filter by Payment Method
            if ($request->filled('payment_method_id')) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->where('payment_method_id', $request->payment_method_id);
                });
            }

            // Search by Invoice Number
            if ($request->filled('keyword')) {
                $query->whereHas('transaction', function ($q) use ($request) {
                    $q->where('invoice_number', 'ilike', "%{$request->keyword}%");
                });
            }

            // Order by
            if ($request->filled('order_by') && $request->filled('order')) {
                $orderBy = $request->order_by;
                if (in_array($orderBy, ['total_revenue', 'total_cost', 'profit'])) {
                    $query->orderBy($orderBy, $request->order);
                } else {
                    $query->orderBy('id', 'desc');
                }
            } else {
                $query->orderBy('id', 'desc');
            }

            // Calculate aggregated totals BEFORE pagination
            $summaryQuery = clone $query;
            $summary = [
                'total_revenue' => (float) $summaryQuery->sum('total_revenue'),
                'total_cost' => (float) $summaryQuery->sum('total_cost'),
                'total_net_profit' => (float) $summaryQuery->sum('profit'),
                'total_transactions' => $summaryQuery->count(),
            ];

            $limit = $request->input('limit', 10);
            $paginated = $query->paginate($limit);

            // Map to clean resource data
            $mappedData = collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'transaction_id' => $item->transaction_id,
                    'invoice_number' => $item->transaction->invoice_number,
                    'created_at' => $item->transaction->created_at->getTimestamp(),
                    'cashier_name' => $item->transaction->user->name ?? '-',
                    'payment_method_name' => $item->transaction->paymentMethod->name ?? '-',
                    'total_revenue' => (float) $item->total_revenue,
                    'total_cost' => (float) $item->total_cost,
                    'profit' => (float) $item->profit,
                ];
            });

            return ResponseApi::make(true, trans('message.success.success'), [
                'summary' => $summary,
                'transactions' => [
                    'data' => $mappedData,
                    'meta' => [
                        'current_page' => $paginated->currentPage(),
                        'last_page' => $paginated->lastPage(),
                        'per_page' => $paginated->perPage(),
                        'total' => $paginated->total(),
                    ],
                ],
            ]);
        } catch (\Throwable $th) {
            return ResponseApi::make(false, $th->getMessage(), null, 500);
        }
    }
}
