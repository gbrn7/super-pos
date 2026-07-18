<?php

namespace App\Support\Interfaces\Services;

use App\Models\Product;
use App\Support\Models\Product\GetProductReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
     * Get a product by its barcode.
     */
    public function getByBarcode(string $barcode): ?Product;

    /**
     * Create a new product.
     */
    public function create(array $data): Product;

    /**
     * Bulk create products.
     *
     * @param  array<int, array<string, mixed>>  $productsData
     */
    public function bulkCreate(array $productsData): int;

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

    /**
     * Export products to excel file.
     */
    public function exportExcel(): BinaryFileResponse;

    /**
     * Export products to pdf file.
     */
    public function exportPdf(): BinaryFileResponse;
}
