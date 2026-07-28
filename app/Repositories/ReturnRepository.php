<?php

namespace App\Repositories;

use App\Models\ProductReturn;
use App\Models\ReturnDetail;
use App\Models\ReturnDetail;
use App\Support\Interfaces\Repositories\ReturnRepositoryInterface;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class ReturnRepository implements ReturnRepositoryInterface
{
    public function getAll(int $limit = 10): Paginator|Collection
    {
        return ProductReturn::with(['transaction', 'user', 'details.product'])
            ->latest()
            ->paginate($limit);
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
