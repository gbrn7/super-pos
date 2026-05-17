<?php

namespace App\Services;

use App\Imports\RoleImport;
use App\Support\Constants\ErrorCode;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;
use App\Support\Models\Role\GetRoleReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

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

            return $this->roleRepository->create($data);
        } catch (\Throwable $th) {
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

            $isSuccess = $this->roleRepository->update($role, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $role;
        } catch (\Throwable $th) {
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
            $deletedCount = $this->roleRepository->deleteMany($ids);

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
