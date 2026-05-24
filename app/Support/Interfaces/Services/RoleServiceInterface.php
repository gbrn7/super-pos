<?php

namespace App\Support\Interfaces\Services;

use App\Models\Role;
use App\Support\Models\Role\GetRoleReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface RoleServiceInterface
{
    /**
     * Get all Roles.
     */
    public function getAllByIndex(GetRoleReqModel $request): Paginator|Collection;

    /**
     * Get a role by its ID.
     */
    public function getById(int $id): ?Role;

    /**
     * Create a new role.
     */
    public function create(array $data): Role;

    /**
     * Update an existing role.
     */
    public function update(int $id, array $data): ?Role;

    /**
     * Delete a role by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete a Roles by ids.
     */
    public function bulkDelete(array $ids): int;
}
