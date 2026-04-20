<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Category;
use App\Support\Model\Request\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CategoryServiceInterface
{
  /**
   * Get all categories.
   * @param GetCategoryReqModel $request
   * @param int|null $paginate
   * @return Paginator|Collection
   */
  public function getAllByIndex(GetCategoryReqModel $request, ?int $paginate = 5): Paginator|Collection;

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
   * @param int $id
   * @param array $data
   * @return Category|null
   */
  public function update(int $id, array $data): ?Category;

  /**
   * Delete a category by its ID.
   *
   * @param int $id
   * @return bool
   */
  public function delete(int $id): bool;
}
