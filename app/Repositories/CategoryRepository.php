<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Category;
use App\Support\Model\Request\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
  public function getAllByIndex(GetCategoryReqModel $request, ?int $paginate = 5): Paginator|Collection
  {
    $query = Category::query()
      ->when($request->name, fn($q) => $q->where('name', 'like', "%{$request->name}%"));

    if ($paginate === null) {
      return $query->get(); // SupportCollection
    }

    return $query->paginate($paginate); // SupportPagination
  }

  public function getById(int $id): ?Category
  {
    return Category::find($id);
  }

  public function create(array $data): Category
  {
    return Category::create($data);
  }

  public function update(Category $category, array $data): bool
  {

    return $category->update($data);
  }

  public function delete(Category $category): bool
  {
    return $category->delete();
  }
}
