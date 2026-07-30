<?php

namespace App\Repositories;

use App\Models\Transaction;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class TransactionRepository implements TransactionRepositoryInterface
{
    public function getAllByIndex(GetTransactionReqModel $request): Paginator|Collection
    {
        // dd($request);
        $query = Transaction::query()
            ->with(['user', 'paymentMethod'])
            ->when($request->keyword, function ($query) use ($request) {
                if ($request->field && $request->field !== 'default') {
                    if ($request->field === 'payment_method_name') {
                        $query->whereHas('paymentMethod', fn ($pm) => $pm->where('name', 'ilike', "%{$request->keyword}%"));
                    } elseif ($request->field === 'user_name') {
                        $query->whereHas('user', fn ($u) => $u->where('name', 'ilike', "%{$request->keyword}%"));
                    } else {
                        $query->where('transactions.'.$request->field, 'ilike', "%{$request->keyword}%");
                    }
                } else {
                    $query->where(function ($q) use ($request) {
                        $q->where('transactions.invoice_number', 'ilike', "%{$request->keyword}%")
                            ->orWhereHas('paymentMethod', fn ($pm) => $pm->where('name', 'ilike', "%{$request->keyword}%"))
                            ->orWhereHas('user', fn ($u) => $u->where('name', 'ilike', "%{$request->keyword}%"));
                    });
                }
            })
            ->when($request->invoice_number, fn ($query) => $query->where('transactions.invoice_number', 'ilike', "%{$request->invoice_number}%"))
            ->when($request->user_id, fn ($query) => $query->where('transactions.user_id', $request->user_id))
            ->when($request->payment_method_id, fn ($query) => $query->where('transactions.payment_method_id', $request->payment_method_id))
            ->when($request->start_date, function ($query) use ($request) {
                $startDate = is_numeric($request->start_date)
                    ? (int) $request->start_date
                    : Carbon::parse($request->start_date)->startOfDay()->getTimestamp();
                $query->where('transactions.created_at', '>=', $startDate);
            })
            ->when($request->end_date, function ($query) use ($request) {
                $endDate = is_numeric($request->end_date)
                    ? (int) $request->end_date
                    : Carbon::parse($request->end_date)->endOfDay()->getTimestamp();
                $query->where('transactions.created_at', '<=', $endDate);
            });

        if (isset($request->order_by) && isset($request->order)) {
            if ($request->order_by === 'payment_method_name') {
                $query->orderBy('payment_method_id', $request->order);
            } else {
                $query->orderBy('transactions.'.$request->order_by, $request->order);
            }
        } else {
            $query->orderBy('transactions.id', 'desc');
        }

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
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
