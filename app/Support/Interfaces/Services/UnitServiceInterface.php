<?php

namespace App\Support\Interfaces\Services;

use App\Models\Unit;
use App\Support\Models\Unit\GetUnitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface UnitServiceInterface
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
    public function update(int $id, array $data): ?Unit;

    /**
     * Delete a unit by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete a units by ids.
     */
    public function bulkDelete(array $ids): int;
}
