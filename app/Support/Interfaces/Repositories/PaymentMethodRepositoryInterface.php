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
   * @param GetPaymentMethodReqModel $request
   * @return Paginator|Collection
   */
  public function getAllByIndex(GetPaymentMethodReqModel $request): Paginator|Collection;

  /**
   * Get a paymentMethod by its ID.
   *
   * @param int $id
   * @return PaymentMethod|null
   */
  public function getById(int $id): ?PaymentMethod;

  /**
   * Create a new paymentMethod.
   *
   * @param array $data
   * @return PaymentMethod
   */
  public function create(array $data): PaymentMethod;

  /**
   * Update an existing paymentMethod.
   *
   * @param PaymentMethod $paymentMethod
   * @param array $data
   * @return bool
   */
  public function update(PaymentMethod $paymentMethod, array $data): bool;

  /**
   * Delete a paymentMethod by its ID.
   *
   * @param PaymentMethod $paymentMethod
   * @return bool
   */
  public function delete(PaymentMethod $paymentMethod): bool;

  /**
   * Delete a payment methods by its Ids.
   *
   * @param array $ids
   * @return int
   */
  public function deleteMany(array $ids): int;


  /**
   * Insert new payment methods.
   *
   * @param array $data
   * @return bool
   */
  public function insert(array $data): bool;

  /**
   * Get a paymentMethod by its name.
   *
   * @param string $name
   * @return PaymentMethod|null
   */
  public function getByName(string $name): ?PaymentMethod;


  /**
   * Get a paymentMethod by its name except id.
   *
   * @param string $name
   * @param int $id
   * @return PaymentMethod|null
   */
  public function getByNameExceptID(string $name, int $id): ?PaymentMethod;
}
