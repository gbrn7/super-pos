<?php

namespace App\Support\Interfaces\Repositories;

use App\Models\MasterProduct;
use App\Support\Models\MasterProduct\GetMasterProductReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface MasterProductRepositoryInterface
{
    /**
     * Get all Master products.
     */
    public function getAllByIndex(GetMasterProductReqModel $request): Paginator|Collection;

    /**
     * Get a Master products by its ID.
     */
    public function getById(int $id): ?MasterProduct;

    /**
     * Create a new Master products.
     */
    public function create(array $data): MasterProduct;

    /**
     * Update an existing Master products.
     */
    public function update(MasterProduct $Masterproduct, array $data): bool;

    /**
     * Delete a Master products by its ID.
     */
    public function delete(MasterProduct $Masterproduct): bool;

    /**
     * Delete Master products by their IDs.
     */
    public function deleteMany(array $ids): int;

    /**
     * Insert new Master products.
     */
    public function insert(array $data): bool;

    /**
     * Get  Master product by its name.
     */
    public function getByName(string $name): ?MasterProduct;

    /**
     * Get  Master product by its ID.
     */
    public function getByIds(array $ids): ?Collection;

    /**
     * Get Master product by its barcode.
     */
    public function getByBarcode(string $barcode): ?MasterProduct;
}
