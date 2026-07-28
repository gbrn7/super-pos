<?php

namespace App\Support\Interfaces\Services;

use App\Models\ProductReturn;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Models\ProductReturn\GetProductReturnReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface ReturnServiceInterface
{
    /**
     * Get all return records.
     */
    public function getAll(GetProductReturnReqModel $request): Paginator|Collection;

    /**
     * Process return transaction and update product stocks atomically.
     */
    public function processReturn(Transaction $transaction, array $items, ?string $reason, User $user): ProductReturn;
}
