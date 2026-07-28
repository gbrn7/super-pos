<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\ReturnDetail;
use App\Models\ReturnModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface ReturnRepositoryInterface
{
    /**
     * Get all return records.
     */
    public function getAll(int $limit = 10): Paginator|Collection;

    /**
     * Get a return record by ID.
     */
    public function getById(int $id): ?ReturnModel;

    /**
     * Create a return record.
     */
    public function create(array $data): ReturnModel;

    /**
     * Get returns by transaction ID.
     */
    public function getByTransactionId(int $transactionId): Collection;

    /**
     * Create a return detail record.
     */
    public function createDetail(array $data): ReturnDetail;
}
