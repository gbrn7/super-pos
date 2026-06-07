<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Role;
use App\Support\Models\Role\GetRoleReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface RoleRepositoryInterface
{
    /**
     * Get all roles.
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
    public function update(Role $role, array $data): bool;

    /**
     * Delete a role by its ID.
     */
    public function delete(Role $role): bool;

    /**
     * Delete a roles by its Ids.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new roles.
     */
    public function insert(array $data): bool;

    /**
     * Get a role by its name.
     */
    public function getByName(string $name): ?Role;

    /**
     * Get a role by its name except id.
     */
    public function getByNameExceptID(string $name, int $id): ?Role;
}
