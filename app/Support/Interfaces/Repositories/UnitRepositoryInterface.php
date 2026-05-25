<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Unit;
use App\Support\Models\Unit\GetUnitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface UnitRepositoryInterface
{
  /**
   * Get all units.
   * @param GetUnitReqModel $request
   * @return Paginator|Collection
   */
  public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection;

  /**
   * Get a unit by its ID.
   *
   * @param int $id
   * @return Unit|null
   */
  public function getById(int $id): ?Unit;

  /**
   * Create a new unit.
   *
   * @param array $data
   * @return Unit
   */
  public function create(array $data): Unit;

  /**
   * Update an existing unit.
   *
   * @param Unit $unit
   * @param array $data
   * @return bool
   */
  public function update(Unit $unit, array $data): bool;

  /**
   * Delete a unit by its ID.
   *
   * @param Unit $unit
   * @return bool
   */
  public function delete(Unit $unit): bool;

  /**
   * Delete a units by its Ids.
   *
   * @param array $ids
   * @return int
   */
  public function deleteMany(array $ids): int;


  /**
   * Insert new units.
   *
   * @param array $data
   * @return bool
   */
  public function insert(array $data): bool;

  /**
   * Get a unit by its name.
   *
   * @param string $name
   * @return Unit|null
   */
  public function getByName(string $name): ?Unit;


  /**
   * Get a unit by its name except id.
   *
   * @param string $name
   * @param int $id
   * @return Unit|null
   */
  public function getByNameExceptID(string $name, int $id): ?Unit;
}
