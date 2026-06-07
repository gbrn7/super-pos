<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\Product;
use App\Support\Models\Product\GetProductReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface ProductRepositoryInterface
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
    public function update(Product $product, array $data): bool;

    /**
     * Delete a product by its ID.
     */
    public function delete(Product $product): bool;

    /**
     * Delete products by their IDs.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new products.
     */
    public function insert(array $data): bool;

    /**
     * Get a product by its name.
     */
    public function getByName(string $name): ?Product;
}
