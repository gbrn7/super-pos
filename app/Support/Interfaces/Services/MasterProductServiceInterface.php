<?php

namespace App\Support\Interfaces\Services;

use App\Models\MasterProduct;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

interface MasterProductServiceInterface
{
    /**
     * Get all Master products.
     */
    /**
     * Get all master products without pagination or filters.
     */
    public function getAllRaw(): Collection;

    /**
     * Get a Masterproduct by its ID.
     */
    public function getById(int $id): ?MasterProduct;

    /**
     * Get a Masterproduct by its barcode.
     */
    public function getByBarcode(string $barcode): ?MasterProduct;

    /**
     * Create a new Masterproduct.
     */
    public function create(array $data): MasterProduct;

    /**
     * Update an existing Masterproduct.
     */
    public function update(int $id, array $data): ?MasterProduct;

    /**
     * Delete a Masterproduct by its ID.
     */
    public function delete(int $id): bool;

    /**
     * Bulk delete Master products by ids.
     */
    public function bulkDelete(array $ids): int;

    /**
     * Import Master products by excel file.
     */
    public function importExcel(UploadedFile $file): int;

    /**
     * Export Master products to excel file.
     */
    public function exportExcel(): BinaryFileResponse;

    /**
     * Export Master products to pdf file.
     */
    public function exportPdf(): BinaryFileResponse;
}
