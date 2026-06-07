<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\PaymentMethod;
use App\Support\Models\PaymentMethod\GetPaymentMethodReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface PaymentMethodRepositoryInterface
{
    /**
     * Get all payment methods.
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
    public function update(PaymentMethod $paymentMethod, array $data): bool;

    /**
     * Delete a paymentMethod by its ID.
     */
    public function delete(PaymentMethod $paymentMethod): bool;

    /**
     * Delete a payment methods by its Ids.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new payment methods.
     */
    public function insert(array $data): bool;

    /**
     * Get a paymentMethod by its name.
     */
    public function getByName(string $name): ?PaymentMethod;

    /**
     * Get a paymentMethod by its name except id.
     */
    public function getByNameExceptID(string $name, int $id): ?PaymentMethod;
}
