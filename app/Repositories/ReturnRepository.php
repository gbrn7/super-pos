<?php

namespace App\Repositories;

use App\Models\ReturnModel;
use App\Support\Interfaces\Repositories\ReturnRepositoryInterface;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class ReturnRepository implements ReturnRepositoryInterface
{
    public function getAll(int $limit = 10): Paginator|Collection
    {
        return ReturnModel::with(['transaction', 'user', 'details.product'])
            ->latest()
            ->paginate($limit);
    }

    public function getById(int $id): ?ReturnModel
    {
        return ReturnModel::with(['transaction', 'user', 'details.product'])->find($id);
    }

    public function create(array $data): ReturnModel
    {
        return ReturnModel::create($data);
    }

    public function getByTransactionId(int $transactionId): Collection
    {
        return ReturnModel::where('transaction_id', $transactionId)->with('details')->get();
    }
}
