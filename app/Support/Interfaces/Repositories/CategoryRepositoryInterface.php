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
     */
    public function getAllByIndex(GetCategoryReqModel $request): Paginator|Collection;

    /**
     * Get a category by its ID.
     */
    public function getById(int $id): ?Category;

    /**
     * Create a new category.
     */
    public function create(array $data): Category;

    /**
     * Update an existing category.
     */
    public function update(Category $category, array $data): bool;

    /**
     * Delete a category by its ID.
     */
    public function delete(Category $category): bool;

    /**
     * Delete a categories by its Ids.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new categories.
     */
    public function insert(array $data): bool;

    /**
     * Get a category by its name.
     */
    public function getByName(string $name): ?Category;

    /**
     * Get a category by its name except id.
     */
    public function getByNameExceptID(string $name, int $id): ?Category;
}
