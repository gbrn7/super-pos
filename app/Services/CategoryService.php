<?php

namespace App\Services;

use App\Imports\CategoryImport;
use App\Models\Category;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Interfaces\Services\CategoryServiceInterface;
use App\Support\Models\Category\GetCategoryReqModel;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
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
            throw $th;
        }
    }

    public function getById(int $id): ?Category
    {
        try {
            return $this->categoryRepository->getById($id);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function create(array $data): Category
    {
        try {
            $isCategoryExist = $this->categoryRepository->getByName($data['name']);

            if (isset($isCategoryExist)) {
                throw new Exception("Category name already used");
            }

            return $this->categoryRepository->create($data);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function update(int $id, array $data): ?Category
    {
        try {
            $category = $this->categoryRepository->getById($id);

            if (!isset($category)) {
                throw new Exception("Category Not Found");
            }

            $isCategoryExist = $this->categoryRepository->getByNameExceptID($data['name'], $id);

            if (isset($isCategoryExist)) {
                throw new Exception("Category name already used");
            }

            $isSuccess = $this->categoryRepository->update($category, $data);

            if (! $isSuccess) {
                throw new Exception('Interal Server Error');
            }

            return $category;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function delete(int $id): bool
    {
        $category = $this->categoryRepository->getById($id);

        if (!isset($category)) {
            throw new Exception("Category not found");
        }
        try {
            $isSuccess = $this->categoryRepository->delete($category);

            if (! $isSuccess) {
                throw new Exception('Internal Server Error');
            }

            return true;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function bulkDelete(array $ids): int
    {
        if (empty($ids)) {
            throw new Exception('No categories selected for deletion.');
        }

        try {
            $deletedCount = $this->categoryRepository->deleteMany($ids);

            return $deletedCount;
        } catch (\Throwable $th) {
            throw $th;
        }
    }


    public function importExcel(UploadedFile $file)
    {
        try {
            $raws = Excel::toArray(new CategoryImport(), $file);

            $newData = Collection::make();

            foreach ($raws as $raw) {
                foreach ($raw as $row) {

                    $newData->push([
                        'name' => $row['nama'],
                        'desc' => $row['deskripsi'],
                    ]);
                }
            }

            $isSuccess = $this->categoryRepository->insert($newData->toArray());
            if (!$isSuccess) {
                throw new Exception("Something went wrong");
            }
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
