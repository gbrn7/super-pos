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
     */
    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection;

    /**
     * Get a unit by its ID.
     */
    public function getById(int $id): ?Unit;

    /**
     * Create a new unit.
     */
    public function create(array $data): Unit;

    /**
     * Update an existing unit.
     */
    public function update(Unit $unit, array $data): bool;

    /**
     * Delete a unit by its ID.
     */
    public function delete(Unit $unit): bool;

    /**
     * Delete a units by its Ids.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new units.
     */
    public function insert(array $data): bool;

    /**
     * Get a unit by its name.
     */
    public function getByName(string $name): ?Unit;

    /**
     * Get a unit by its name except id.
     */
    public function getByNameExceptID(string $name, int $id): ?Unit;
}
