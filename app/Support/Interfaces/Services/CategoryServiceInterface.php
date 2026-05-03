<?php

namespace App\Support\Interfaces\Services;

use App\Models\Category;
use App\Support\Models\Category\GetCategoryReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface CategoryServiceInterface
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
    public function update(int $id, array $data): ?Category;

    /**
     * Delete a category by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete a categories by ids.
     */
    public function bulkDelete(array $ids): int;

    /**
     * Import categories by excel file.
     */
    public function importExcel(UploadedFile $file);
}
