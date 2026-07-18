<?php

namespace App\Support\Interfaces\Services;

use App\Models\Transaction;
use App\Support\Models\Transaction\GetTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface TransactionServiceInterface
{
    /**
     * Get all transactions.
     */
    public function getAllByIndex(GetTransactionReqModel $request): Paginator|Collection;

    /**
     * Get a transaction by its ID.
     */
    public function getById(int $id): ?Transaction;

    /**
     * Get a transaction by its invoice number.
     */
    public function getByInvoiceNumber(string $invoiceNumber): ?Transaction;

    /**
     * Create a new transaction.
     */
    public function create(array $data): Transaction;

    /**
     * Update an existing transaction.
     */
    public function update(int $id, array $data): ?Transaction;

    /**
     * Delete a transaction by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete transactions by IDs.
     */
    public function bulkDelete(array $ids): int;
}
