<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Category;
use App\Support\Models\Category\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CategoryRepositoryInterface
{
  /**
   * Get all categories.
   * @param GetCategoryReqModel $request
   * @return Paginator|Collection
   */
  public function getAllByIndex(GetCategoryReqModel $request): Paginator|Collection;

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
   * @return bool
   */
  public function update(Category $category, array $data): bool;

  /**
   * Delete a category by its ID.
   *
   * @param Category $category
   * @return bool
   */
  public function delete(Category $category): bool;

  /**
   * Delete a categories by its Ids.
   *
   * @param array $ids
   * @return int
   */
  public function deleteMany(array $ids): int;


  /**
   * Insert new categories.
   *
   * @param array $data
   * @return bool
   */
  public function insert(array $data): bool;
}
