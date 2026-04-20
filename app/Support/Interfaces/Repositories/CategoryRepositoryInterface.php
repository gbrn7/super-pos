<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Category;
use App\Support\Model\Request\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CategoryRepositoryInterface
{
  /**
   * Get all categories.
   * @param GetCategoryReqModel $request
   * @param int|null $paginate
   * @return Paginator|SupportCollection
   */
  public function getAllByIndex(GetCategoryReqModel $request, ?int $paginate): Paginator|Collection;

  /**
   * Get a category by its ID.
   *
   * @param int $id
   * @return Category|null
   */
  public function getById(int $id): ?Category;

  /**
   * Create a new category.
   *
   * @param array $data
   * @return Category
   */
  public function create(array $data): Category;

  /**
   * Update an existing category.
   *
   * @param Category $category
   * @param array $data
   * @return Category|null
   */
  public function update(Category $category, array $data): bool;

  /**
   * Delete a category by its ID.
   *
   * @param Category $category
   * @return bool
   */
  public function delete(Category $category): bool;
}
