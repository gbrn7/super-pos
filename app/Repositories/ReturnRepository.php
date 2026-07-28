<?php

namespace App\Repositories;

use App\Models\ProductReturn;
use App\Models\ReturnDetail;
use App\Support\Interfaces\Repositories\ReturnRepositoryInterface;
use App\Support\Models\ProductReturn\GetProductReturnReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class ReturnRepository implements ReturnRepositoryInterface
{
    public function getAll(GetProductReturnReqModel $request): Paginator|Collection
    {
        $query = ProductReturn::with(['transaction', 'user', 'details.product'])
            ->when($request->keyword, function ($query) use ($request) {
                if ($request->field && $request->field !== 'default') {
                    if ($request->field === 'return_number') {
                        $query->where('return_number', 'ilike', "%{$request->keyword}%");
                    } elseif ($request->field === 'invoice_number') {
                        $query->whereHas('transaction', fn ($q) => $q->where('invoice_number', 'ilike', "%{$request->keyword}%"));
                    } elseif ($request->field === 'user_name') {
                        $query->whereHas('user', fn ($q) => $q->where('name', 'ilike', "%{$request->keyword}%"));
                    } else {
                        $query->where($request->field, 'ilike', "%{$request->keyword}%");
                    }
                } else {
                    $query->where(function ($q) use ($request) {
                        $q->where('return_number', 'ilike', "%{$request->keyword}%")
                            ->orWhereHas('transaction', fn ($t) => $t->where('invoice_number', 'ilike', "%{$request->keyword}%"))
                            ->orWhereHas('user', fn ($u) => $u->where('name', 'ilike', "%{$request->keyword}%"));
                    });
                }
            });

        if ($request->order_by && $request->order) {
            $query->orderBy($request->order_by, $request->order);
        } else {
            $query->latest();
        }

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit);
    }

    public function getById(int $id): ?ProductReturn
    {
        return ProductReturn::with(['transaction', 'user', 'details.product'])->find($id);
    }

    public function create(array $data): ProductReturn
    {
        return ProductReturn::create($data);
    }

    public function getByTransactionId(int $transactionId): Collection
    {
        return ProductReturn::where('transaction_id', $transactionId)->with('details')->get();
    }

    public function createDetail(array $data): ReturnDetail
    {
        return ReturnDetail::create($data);
    }
}
