<?php

namespace App\Support\Interfaces\Services;

use App\Models\Product;
use App\Support\Models\Product\GetProductReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface ProductServiceInterface
{
    /**
     * Get all products.
     */
    public function getAllByIndex(GetProductReqModel $request): Paginator|Collection;

    /**
     * Get a product by its ID.
     */
    public function getById(int $id): ?Product;

    /**
     * Create a new product.
     */
    public function create(array $data): Product;

    /**
     * Update an existing product.
     */
    public function update(int $id, array $data): ?Product;

    /**
     * Delete a product by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete products by ids.
     */
    public function bulkDelete(array $ids): int;

    /**
     * Import products by excel file.
     */
    public function importExcel(UploadedFile $file): int;
}
