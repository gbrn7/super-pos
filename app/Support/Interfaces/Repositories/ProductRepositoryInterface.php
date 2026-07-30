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
     * Get total number of products.
     */
    public function getTotalProductsCount(): int;

    /**
     * Get count of out-of-stock products (stock <= 0 and not unlimited).
     */
    public function getOutOfStockProductsCount(): int;

    /**
     * Get best‑selling products limited by count.
     */
    public function getBestSellers(int $limit): Collection;

    /**
     * Insert new products.
     */
    public function insert(array $data): bool;

    /**
     * Get  product by its name.
     */
    public function getByName(string $name): ?Product;

    /**
     * Get  product by its ID.
     */
    public function getByIds(array $ids): ?Collection;

    /**
     * Get  product by its Barcode.
     */
    public function getByBarcode(string $barcode): ?Product;

    /**
     * Decrement stock of a product.
     */
    public function decrementStock(Product $product, int $quantity = 1): bool;

    /**
     * Increment stock of a product.
     */
    public function incrementStock(Product $product, int $quantity = 1): bool;

    /**
     * Increment sold quantity of a product.
     */
    public function incrementSoldQuantity(Product $product, int $quantity = 1): bool;

    /**
     * Decrement sold quantity of a product.
     */
    public function decrementSoldQuantity(Product $product, int $quantity = 1): bool;
}
