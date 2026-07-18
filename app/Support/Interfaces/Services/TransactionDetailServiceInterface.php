<?php

namespace App\Support\Interfaces\Services;

use App\Models\TransactionDetail;
use App\Support\Models\TransactionDetail\GetTransactionDetailReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface TransactionDetailServiceInterface
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
    public function update(int $id, array $data): ?TransactionDetail;

    /**
     * Delete a transaction detail by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete transaction details by IDs.
     */
    public function bulkDelete(array $ids): int;
}
