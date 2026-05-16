<?php

namespace App\Services;

use App\Imports\CategoryImport;
use App\Models\Category;
use App\Support\Constants\ErrorCode;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Models\Category\GetCategoryReqModel;
use App\Support\Utils\CheckException;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;

class CategoryService implements CategoryServiceInterface
{
    public function __construct(protected CategoryRepositoryInterface $categoryRepository) {}

    public function getAllByIndex(GetCategoryReqModel $request): Paginator|Collection
    {
        try {
            return $this->categoryRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?Category
    {
        try {
            return $this->categoryRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): Category
    {
        try {
            $isCategoryExist = $this->categoryRepository->getByName($data['name']);

            if (isset($isCategoryExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return $this->categoryRepository->create($data);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?Category
    {
        try {
            $category = $this->categoryRepository->getById($id);

            if (!isset($category)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            $isCategoryExist = $this->categoryRepository->getByNameExceptID($data['name'], $id);

            if (isset($isCategoryExist)) {
                throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $isSuccess = $this->categoryRepository->update($category, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $category;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $category = $this->categoryRepository->getById($id);

            if (!isset($category)) {
                throw new Exception(trans("message.error.data_not_found"), Response::HTTP_NOT_FOUND);
            }

            $isSuccess = $this->categoryRepository->delete($category);

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
            $deletedCount = $this->categoryRepository->deleteMany($ids);

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function importExcel(UploadedFile $file): int
    {
        try {
            $raws = Excel::toArray(new CategoryImport(), $file);

            $newData = Collection::make();

            $unixTime = Carbon::now()->unix();

            foreach ($raws as $raw) {
                foreach ($raw as $row) {

                    $newData->push([
                        'name' => $row['nama'],
                        'desc' => $row['deskripsi'],
                        'created_at' => $unixTime,
                        'updated_at' => $unixTime,
                    ]);
                }
            }

            $isSuccess = $this->categoryRepository->insert($newData->toArray());
            if (!$isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $newData->count();
        } catch (\Throwable $th) {

            if ($th->getCode() === ErrorCode::SQL_UNIQUE_VIOLATION) {
                $th = new Exception(trans('message.error.internal_server_error_import'), RESPONSE::HTTP_INTERNAL_SERVER_ERROR);
            }

            throw CheckException::Check($th);
        }
    }
}
