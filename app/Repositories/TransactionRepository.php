<?php

namespace App\Repositories;

use App\Models\ProductReturn;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use App\Support\Utils\QueryHelper;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class TransactionRepository implements TransactionRepositoryInterface
{
    /**
     * Build base query with all search and filter conditions.
     */
    protected function buildFilterQuery(GetTransactionReqModel $request): Builder
    {
        $like = QueryHelper::likeOperator();

        return Transaction::query()
            ->when($request->keyword, function ($query) use ($request, $like) {
                if ($request->field && $request->field !== 'default') {
                    if ($request->field === 'payment_method_name') {
                        $query->whereHas('paymentMethod', fn ($pm) => $pm->where('name', $like, "%{$request->keyword}%"));
                    } elseif ($request->field === 'user_name') {
                        $query->whereHas('user', fn ($u) => $u->where('name', $like, "%{$request->keyword}%"));
                    } else {
                        $query->where('transactions.'.$request->field, $like, "%{$request->keyword}%");
                    }
                } else {
                    $query->where(function ($q) use ($request, $like) {
                        $q->where('transactions.invoice_number', $like, "%{$request->keyword}%")
                            ->orWhereHas('paymentMethod', fn ($pm) => $pm->where('name', $like, "%{$request->keyword}%"))
                            ->orWhereHas('user', fn ($u) => $u->where('name', $like, "%{$request->keyword}%"));
                    });
                }
            })
            ->when($request->invoice_number, fn ($query) => $query->where('transactions.invoice_number', $like, "%{$request->invoice_number}%"))
            ->when($request->user_id, fn ($query) => $query->where('transactions.user_id', $request->user_id))
            ->when($request->payment_method_id, fn ($query) => $query->where('transactions.payment_method_id', $request->payment_method_id))
            ->when($request->start_date, function ($query) use ($request) {
                $startDate = Carbon::parse($request->start_date)->startOfDay();
                $query->where('transactions.created_at', '>=', $startDate);
            })
            ->when($request->end_date, function ($query) use ($request) {
                $endDate = Carbon::parse($request->end_date)->endOfDay();
                $query->where('transactions.created_at', '<=', $endDate);
            });
    }

    /**
     * Apply sorting to query.
     */
    protected function applySorting(Builder $query, GetTransactionReqModel $request): Builder
    {
        if (isset($request->order_by) && isset($request->order)) {
            if ($request->order_by === 'payment_method_name') {
                return $query->orderBy('payment_method_id', $request->order);
            } else {
                return $query->orderBy('transactions.'.$request->order_by, $request->order);
            }
        }

        return $query->orderBy('transactions.id', 'desc');
    }

    public function getAllByIndex(GetTransactionReqModel $request): Paginator|Collection
    {
        $query = $this->buildFilterQuery($request)
            ->with(['user', 'paymentMethod', 'transactionDetails', 'returns']);

        $this->applySorting($query, $request);

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getAllForExport(GetTransactionReqModel $request): Collection
    {
        $query = $this->buildFilterQuery($request)
            ->select(
                'transactions.id',
                'transactions.invoice_number',
                'transactions.user_id',
                'transactions.payment_method_id',
                'transactions.total_amount',
                'transactions.discount_amount',
                'transactions.created_at'
            )
            ->with(['user:id,name', 'paymentMethod:id,name'])
            ->withSum('returns', 'total_refund_amount')
            ->withSum('transactionDetails', 'quantity');

        $this->applySorting($query, $request);

        if ($request->limit !== null) {
            $query->limit($request->limit);
        }

        return $query->get();
    }

    public function getTransactionSummary(GetTransactionReqModel $request): array
    {
        $query = $this->buildFilterQuery($request);

        $count = (clone $query)->count();
        $grossSales = (float) (clone $query)->sum('transactions.total_amount');
        $totalDiscounts = (float) (clone $query)->sum('transactions.discount_amount');

        $transactionIds = (clone $query)->select('transactions.id');

        $totalReturns = (float) ProductReturn::whereIn('transaction_id', $transactionIds)
            ->sum('total_refund_amount');

        $grossProfit = (float) (TransactionDetail::whereIn('transaction_id', $transactionIds)
            ->selectRaw('SUM((price - cost_price - discount) * quantity) as gross_profit')
            ->value('gross_profit') ?? 0);

        $netSales = $grossSales - $totalReturns;
        $netProfit = $grossProfit - $totalReturns;

        return [
            'count' => $count,
            'gross_sales' => $grossSales,
            'total_discounts' => $totalDiscounts,
            'total_returns' => $totalReturns,
            'gross_profit' => $grossProfit,
            'net_sales' => $netSales,
            'net_profit' => $netProfit,
        ];
    }

    public function getById(int $id): ?Transaction
    {
        return Transaction::with(['user', 'paymentMethod', 'transactionDetails.product', 'returns.details'])->find($id);
    }

    public function getByInvoiceNumber(string $invoiceNumber): ?Transaction
    {
        return Transaction::with(['user', 'paymentMethod', 'transactionDetails.product', 'returns.details'])->where('invoice_number', $invoiceNumber)->first();
    }

    public function create(array $data): Transaction
    {
        return Transaction::create($data);
    }

    public function update(Transaction $transaction, array $data): bool
    {
        return $transaction->update($data);
    }

    public function delete(Transaction $transaction): bool
    {
        return $transaction->delete();
    }

    public function deleteMany(array $ids): int
    {
        return Transaction::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return Transaction::insert($data);
    }
}
