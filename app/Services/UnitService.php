<?php

namespace App\Services;

use App\Exports\UnitExport;
use App\Imports\UnitImport;
use App\Models\Unit;
use App\Support\Constants\ErrorCode;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Interfaces\Services\UnitServiceInterface;
use App\Support\Models\Unit\GetUnitReqModel;
use App\Support\Utils\CheckException;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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

            if (! isset($unit)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
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

            if (! isset($unit)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
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

    public function importExcel(UploadedFile $file): int
    {
        try {
            $raws = Excel::toArray(new UnitImport, $file);

            $newData = Collection::make();

            $unixTime = Carbon::now()->unix();

            foreach ($raws as $raw) {
                foreach ($raw as $row) {
                    $newData->push([
                        'name' => $row['nama'],
                        'created_at' => $unixTime,
                        'updated_at' => $unixTime,
                    ]);
                }
            }

            $isSuccess = $this->unitRepository->insert($newData->toArray());
            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $newData->count();
        } catch (\Throwable $th) {
            if ($th->getCode() === ErrorCode::SQL_UNIQUE_VIOLATION) {
                $th = new Exception(trans('message.error.duplicate_data_error_import'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            throw CheckException::Check($th);
        }
    }

    public function exportExcel(): BinaryFileResponse
    {
        try {
            set_time_limit(600);
            ini_set('memory_limit', '512M');

            return Excel::download(new UnitExport, 'units-export.xlsx');
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
