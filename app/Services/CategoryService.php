<?php

use App\Models\Category;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Interfaces\Repositories\CategoryServiceInterface;
use App\Support\Model\Request\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class CategoryService implements CategoryServiceInterface
{

  public function __construct(protected CategoryRepositoryInterface $categoryRepository) {}


  public function getAllByIndex(GetCategoryReqModel $request, ?int $paginate = 5): Paginator|Collection
  {
    return $this->categoryRepository->getAllByIndex($request, $paginate);
  }

  public function getById(int $id): ?Category
  {
    return $this->categoryRepository->getById($id);
  }

  public function create(array $data): Category
  {
    return $this->categoryRepository->create($data);
  }

  public function update(int $id, array $data): ?Category
  {
    $category = $this->categoryRepository->getById($id);

    if (!$category) throw new Exception("Kategori dengan ID {$id} tidak ditemukan.");

    return $this->categoryRepository->update($category, $data);
  }

  public function delete(int $id): bool
  {
    $category = $this->categoryRepository->getById($id);

    if (!$category) throw new Exception("Kategori dengan ID {$id} tidak ditemukan.");

    return $this->categoryRepository->delete($category);
  }
}
