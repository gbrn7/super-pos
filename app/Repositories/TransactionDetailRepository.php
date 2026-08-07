<?php

namespace App\Repositories;

use App\Models\TransactionDetail;
use App\Support\Interfaces\Repositories\TransactionDetailRepositoryInterface;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use App\Support\Utils\QueryHelper;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class TransactionDetailRepository implements TransactionDetailRepositoryInterface
{
    public function getAllByIndex(GetTransactionDetailReqModel $request): Paginator|Collection
    {
        $like = QueryHelper::likeOperator();

        $query = TransactionDetail::query()
            ->with(['transaction', 'product'])
            ->when($request->keyword, function ($query) use ($request, $like) {
                if ($request->field && $request->field !== 'default') {
                    $query->where('transaction_detail.'.$request->field, $like, "%{$request->keyword}%");
                } else {
                    $query->where(function ($q) use ($request, $like) {
                        $q->where('transaction_detail.unit_name', $like, "%{$request->keyword}%");
                    });
                }
            })
            ->when($request->transaction_id, fn ($query) => $query->where('transaction_detail.transaction_id', $request->transaction_id))
            ->when($request->product_id, fn ($query) => $query->where('transaction_detail.product_id', $request->product_id))
            ->when($request->unit_name, fn ($query) => $query->where('transaction_detail.unit_name', $like, "%{$request->unit_name}%"));

        if (isset($request->order_by) && isset($request->order)) {
            $query->orderBy('transaction_detail.'.$request->order_by, $request->order);
        } else {
            $query->orderBy('transaction_detail.id', 'desc');
        }

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?TransactionDetail
    {
        return TransactionDetail::with(['transaction', 'product'])->find($id);
    }

    public function getByTransactionId(int $transactionId): Collection
    {
        return TransactionDetail::with(['transaction', 'product'])
            ->where('transaction_id', $transactionId)
            ->get();
    }

    public function create(array $data): TransactionDetail
    {
        return TransactionDetail::create($data);
    }

    public function update(TransactionDetail $transactionDetail, array $data): bool
    {
        return $transactionDetail->update($data);
    }

    public function delete(TransactionDetail $transactionDetail): bool
    {
        return $transactionDetail->delete();
    }

    public function deleteMany(array $ids): int
    {
        return TransactionDetail::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return TransactionDetail::insert($data);
    }
}
