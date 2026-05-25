<?php

namespace App\Services;

use App\Models\Unit;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Interfaces\Services\UnitServiceInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use App\Support\Utils\CheckException;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class UnitService implements UnitServiceInterface
{
    public function __construct(protected UnitRepositoryInterface $unitRepository) {}

    public function getAllByIndex(GetUnitReqModel $request): Paginator|Collection
    {
        try {
            return $this->unitRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?Unit
    {
        try {
            return $this->unitRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): Unit
    {
        try {
            $isUnitExist = $this->unitRepository->getByName($data['name']);

            if (isset($isUnitExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return $this->unitRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?Unit
    {
        try {
            $unit = $this->unitRepository->getById($id);

            if (!isset($unit)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            $isUnitExist = $this->unitRepository->getByNameExceptID($data['name'], $id);

            if (isset($isUnitExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $isSuccess = $this->unitRepository->update($unit, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $unit;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $unit = $this->unitRepository->getById($id);

            if (!isset($unit)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->unitRepository->delete($unit);

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
            $deletedCount = $this->unitRepository->deleteMany($ids);

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
