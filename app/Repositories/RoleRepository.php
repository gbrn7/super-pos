<?php

namespace App\Repositories;

use App\Models\Role;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Models\Role\GetRoleReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class RoleRepository implements RoleRepositoryInterface
{
  public function getAllByIndex(GetRoleReqModel $request): Paginator|Collection
  {
    $query = Role::query()
      ->orderBy('id', 'desc')
      ->when($request->name, fn($query) => $query->where('name', 'like', "%{$request->name}%"))
      ->where('name', '!=', RoleEnums::SUPER_ADMIN->value);

    if ($request->limit === null) {
      return $query->get();
    }

    return $query->paginate($request->limit)->onEachSide(1);
  }

  public function getById(int $id): ?Role
  {
    return Role::find($id);
  }

  public function create(array $data): Role
  {
    return Role::create($data);
  }

  public function update(Role $role, array $data): bool
  {
    return $role->update($data);
  }

  public function delete(Role $role): bool
  {
    return $role->delete();
  }

  public function deleteMany(array $ids): int
  {
    return Role::destroy($ids);
  }

  public function insert(array $data): bool
  {
    return Role::insert($data);
  }

  public function getByName(string $name): ?Role
  {
    return Role::where('name', $name)->first();
  }

  public function getByNameExceptID(string $name, int $id): ?Role
  {
    return Role::where('name', $name)->where('id', "!=", $id)->first();
  }
}
