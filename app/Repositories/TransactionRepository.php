<?php

namespace App\Repositories;

use App\Models\Transaction;
use App\Support\Interfaces\Repositories\TransactionRepositoryInterface;
use App\Support\Models\Transaction\GetTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class TransactionRepository implements TransactionRepositoryInterface
{
    public function getAllByIndex(GetTransactionReqModel $request): Paginator|Collection
    {
        $query = Transaction::query()
            ->with(['user'])
            ->when($request->keyword, function ($query) use ($request) {
                if ($request->field && $request->field !== 'default') {
                    $query->where('transactions.'.$request->field, 'ilike', "%{$request->keyword}%");
                } else {
                    $query->where(function ($q) use ($request) {
                        $q->where('transactions.invoice_number', 'ilike', "%{$request->keyword}%")
                            ->orWhere('transactions.payment_method_name', 'ilike', "%{$request->keyword}%");
                    });
                }
            })
            ->when($request->invoice_number, fn ($query) => $query->where('transactions.invoice_number', 'ilike', "%{$request->invoice_number}%"))
            ->when($request->user_id, fn ($query) => $query->where('transactions.user_id', $request->user_id))
            ->when($request->payment_method_name, fn ($query) => $query->where('transactions.payment_method_name', 'ilike', "%{$request->payment_method_name}%"))
            ->when($request->start_date, fn ($query) => $query->whereDate('transactions.created_at', '>=', $request->start_date))
            ->when($request->end_date, fn ($query) => $query->whereDate('transactions.created_at', '<=', $request->end_date));

        if (isset($request->order_by) && isset($request->order)) {
            $query->orderBy('transactions.'.$request->order_by, $request->order);
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
        return Transaction::with(['user', 'transactionDetails.product'])->find($id);
    }

    public function getByInvoiceNumber(string $invoiceNumber): ?Transaction
    {
        return Transaction::with(['user', 'transactionDetails.product'])->where('invoice_number', $invoiceNumber)->first();
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
