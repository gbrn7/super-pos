<?php

namespace App\Services;

use App\Models\Role;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;
use App\Support\Models\Role\GetRoleReqModel;
use App\Support\Models\Role\StoreRoleReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RoleService implements RoleServiceInterface
{
    public function __construct(protected RoleRepositoryInterface $roleRepository) {}

    public function getAllByIndex(GetRoleReqModel $request): Paginator|Collection
    {
        try {
            return $this->roleRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?Role
    {
        try {
            return $this->roleRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): Role
    {
        try {
            $isRoleExist = $this->roleRepository->getByName($data['name']);

            if (isset($isRoleExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            DB::beginTransaction();

            $role =  $this->roleRepository->create($data);

            $role->givePermissionTo($data['permissions']);

            DB::commit();

            return $role;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?Role
    {
        try {
            $role = $this->roleRepository->getById($id);

            if (!isset($role)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            $isRoleExist = $this->roleRepository->getByNameExceptID($data['name'], $id);

            if (isset($isRoleExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if ($role->name === RoleEnums::SUPER_ADMIN->value) {
                throw new Exception(trans('message.error.super_admin_cannot_be_updated'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            DB::beginTransaction();

            $isSuccess = $this->roleRepository->update($role, $data);

            $role->syncPermissions($data['permissions']);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            DB::commit();

            return $role;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $role = $this->roleRepository->getById($id);

            if (!isset($role)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            if ($role->name === RoleEnums::SUPER_ADMIN->value) {
                throw new Exception(trans('message.error.super_admin_cannot_be_deleted'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $count = $role->users()->count();
            if ($count > 0) {
                throw new Exception(trans('message.error.role_data_used_by_user'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $isSuccess = $this->roleRepository->delete($role);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function bulkDelete(array $ids): int
    {
        try {
            $deletedCount = 0;
            foreach ($ids as $id) {
                $role = $this->roleRepository->getById($id);

                if (!isset($role)) {
                    throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
                }

                if ($role->name === RoleEnums::SUPER_ADMIN->value) {
                    throw new Exception(trans('message.error.super_admin_cannot_be_deleted'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $count = $role->users()->count();
                if ($count > 0) {
                    throw new Exception(trans('message.error.role_data_used_by_user'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $isSuccess = $this->roleRepository->delete($role);

                if (! $isSuccess) {
                    throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                $deletedCount++;
            }

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
