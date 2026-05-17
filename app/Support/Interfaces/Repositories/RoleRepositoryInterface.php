<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Role;
use App\Support\Models\Role\GetRoleReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface RoleRepositoryInterface
{
  /**
   * Get all categories.
   * @param GetRoleReqModel $request
   * @return Paginator|Collection
   */
  public function getAllByIndex(GetRoleReqModel $request): Paginator|Collection;

  /**
   * Get a role by its ID.
   *
   * @param int $id
   * @return Role|null
   */
  public function getById(int $id): ?Role;

  /**
   * Create a new role.
   *
   * @param array $data
   * @return Role
   */
  public function create(array $data): Role;

  /**
   * Update an existing role.
   *
   * @param Role $role
   * @param array $data
   * @return bool
   */
  public function update(Role $role, array $data): bool;

  /**
   * Delete a role by its ID.
   *
   * @param Role $role
   * @return bool
   */
  public function delete(Role $role): bool;

  /**
   * Delete a categories by its Ids.
   *
   * @param array $ids
   * @return int
   */
  public function deleteMany(array $ids): int;


  /**
   * Insert new categories.
   *
   * @param array $data
   * @return bool
   */
  public function insert(array $data): bool;

  /**
   * Get a role by its name.
   *
   * @param string $name
   * @return Role|null
   */
  public function getByName(string $name): ?Role;


  /**
   * Get a role by its name except id.
   *
   * @param string $name
   * @param int $id
   * @return Role|null
   */
  public function getByNameExceptID(string $name, int $id): ?Role;
}
