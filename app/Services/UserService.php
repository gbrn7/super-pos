<?php

namespace App\Services;

use App\Models\User;
use App\Support\Enums\RoleEnums;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Support\Models\User\GetUserReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserService implements UserServiceInterface
{
    public function __construct(protected UserRepositoryInterface $userRepository) {}

    public function getAllByIndex(GetUserReqModel $request): Paginator|Collection
    {
        try {
            return $this->userRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?User
    {
        try {
            $user = $this->userRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }

        return $user;
    }

    public function create(array $data): User
    {
        try {
            DB::beginTransaction();

            $user =  $this->userRepository->create($data);

            $user->assignRole($data['role']);

            DB::commit();

            return $user;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?User
    {
        try {
            $user = $this->userRepository->getById($id);

            if (!isset($user)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            DB::beginTransaction();

            $isSuccess = $this->userRepository->update($user, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            if ($user->hasRole(RoleEnums::SUPER_ADMIN->value)) {
                throw new Exception(trans('message.error.super_admin_cannot_be_updated'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user->syncRoles($data['role']);

            DB::commit();

            return $user;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $user = $this->userRepository->getById($id);

            if (!isset($user)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            if ($user->hasRole(RoleEnums::SUPER_ADMIN->value)) {
                throw new Exception(trans('message.error.super_admin_cannot_be_deleted'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $isSuccess = $this->userRepository->delete($user);

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

            DB::beginTransaction();

            foreach ($ids as $id) {
                $user = $this->userRepository->getById($id);

                if (!isset($user)) {
                    throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
                }

                if ($user->hasRole(RoleEnums::SUPER_ADMIN->value)) {
                    throw new Exception(trans('message.error.super_admin_cannot_be_deleted'), Response::HTTP_UNPROCESSABLE_ENTITY);
                }

                $isSuccess = $this->userRepository->delete($user);

                if (! $isSuccess) {
                    throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                $deletedCount++;
            }

            DB::commit();

            return $deletedCount;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }
}
