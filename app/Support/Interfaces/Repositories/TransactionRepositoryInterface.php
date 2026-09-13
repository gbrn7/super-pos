<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Transaction;
use App\Support\Models\Transaction\GetTransactionReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface TransactionRepositoryInterface
{
    /**
     * Get all transactions.
     */
    public function getAllByIndex(GetTransactionReqModel $request): Paginator|Collection;

    /**
     * Get transactions specifically optimized for export.
     */
    public function getAllForExport(GetTransactionReqModel $request): Collection;

    /**
     * Get aggregated transaction summary for reports.
     */
    public function getTransactionSummary(GetTransactionReqModel $request): array;

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
    public function update(Transaction $transaction, array $data): bool;

    /**
     * Delete a transaction by its ID.
     */
    public function delete(Transaction $transaction): bool;

    /**
     * Delete transactions by its Ids.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new transactions.
     */
    public function insert(array $data): bool;
}
