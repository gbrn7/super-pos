<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\TransactionDetail;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface TransactionDetailRepositoryInterface
{
    /**
     * Get all transaction details.
     */
    public function getAllByIndex(GetTransactionDetailReqModel $request): Paginator|Collection;

    /**
     * Get a transaction detail by its ID.
     */
    public function getById(int $id): ?TransactionDetail;

    /**
     * Get transaction details by transaction ID.
     */
    public function getByTransactionId(int $transactionId): Collection;

    /**
     * Create a new transaction detail.
     */
    public function create(array $data): TransactionDetail;

    /**
     * Update an existing transaction detail.
     */
    public function update(TransactionDetail $transactionDetail, array $data): bool;

    /**
     * Delete a transaction detail by its instance.
     */
    public function delete(TransactionDetail $transactionDetail): bool;

    /**
     * Delete transaction details by IDs.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new transaction details.
     */
    public function insert(array $data): bool;
}
