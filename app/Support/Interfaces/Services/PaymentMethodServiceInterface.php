<?php

namespace App\Support\Interfaces\Services;

use App\Models\PaymentMethod;
use App\Support\Models\PaymentMethod\GetPaymentMethodReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface PaymentMethodServiceInterface
{
    /**
     * Get all PaymentMethods.
     */
    public function getAllByIndex(GetPaymentMethodReqModel $request): Paginator|Collection;

    /**
     * Get a paymentMethod by its ID.
     */
    public function getById(int $id): ?PaymentMethod;

    /**
     * Create a new paymentMethod.
     */
    public function create(array $data): PaymentMethod;

    /**
     * Update an existing paymentMethod.
     */
    public function update(int $id, array $data): ?PaymentMethod;

    /**
     * Delete a paymentMethod by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete a PaymentMethods by ids.
     */
    public function bulkDelete(array $ids): int;
}
