<?php

namespace App\Services;

use App\Imports\ProductImport;
use App\Models\Product;
use App\Support\Constants\Constants;
use App\Support\Constants\ErrorCode;
use App\Support\Interfaces\Repositories\CategoryRepositoryInterface;
use App\Support\Interfaces\Repositories\MasterProductRepositoryInterface;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Repositories\UnitRepositoryInterface;
use App\Support\Interfaces\Services\ProductServiceInterface;
use App\Support\Models\Category\GetCategoryReqModel;
use App\Support\Models\Product\GetProductReqModel;
use App\Support\Models\Unit\GetUnitReqModel;
use App\Support\Utils\BarcodeGenerator;
use App\Support\Utils\CheckException;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductService implements ProductServiceInterface
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
        protected CategoryRepositoryInterface $categoryRepository,
        protected UnitRepositoryInterface $unitRepository,
        protected MasterProductRepositoryInterface $masterProductRepository
    ) {}

    public function getAllByIndex(GetProductReqModel $request): Paginator|Collection
    {
        try {
            return $this->productRepository->getAllByIndex($request);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getById(int $id): ?Product
    {
        try {
            return $this->productRepository->getById($id);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function getByBarcode(string $barcode): ?Product
    {
        try {
            $product = $this->productRepository->getByBarcode($barcode);

            if (! isset($product)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            return $product;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function create(array $data): Product
    {
        DB::beginTransaction();

        try {
            if ($data['cost_price'] > $data['price']) {
                throw new Exception(
                    trans('message.error.cost_price_greater_than_price_validation'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            // Generate SKU from product name
            $data['sku'] = Str::of($data['name'])
                ->headline()
                ->replaceMatches('/[^A-Z]/', '').'-'.strtoupper(Str::random(8));

            if (empty($data['barcode'])) {
                do {
                    $generatedBarcode = strtoupper(Str::random(4)).mt_rand(1000000000000, 9999999999999);
                } while ($this->productRepository->getByBarcode($generatedBarcode) !== null);

                $data['barcode'] = $generatedBarcode;
            } else {
                $product = $this->productRepository->getByBarcode($data['barcode']);

                if (isset($product)) {
                    throw new Exception(
                        sprintf(trans('message.error.product_with_barcode_exist'), $data['barcode']),
                        Response::HTTP_UNPROCESSABLE_ENTITY
                    );
                }
            }

            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                $fileName = Str::random(10).$data['image']->getClientOriginalName();
                $data['image']->storeAs(Constants::PRODUCT_PUBLIC_PATH, $fileName, 'public');
                $data['image'] = Constants::PRODUCT_PUBLIC_PATH.$fileName;
            }

            $createdProduct = $this->productRepository->create($data);

            if (! empty($data['barcode'])) {
                $masterProduct = $this->masterProductRepository->getByBarcode($data['barcode']);
                $category = isset($data['category_id']) ? $this->categoryRepository->getById((int) $data['category_id']) : null;
                $unit = isset($data['unit_id']) ? $this->unitRepository->getById((int) $data['unit_id']) : null;

                if ($masterProduct) {
                    $masterUpdateData = [
                        'cost_price' => $data['cost_price'],
                        'price' => $data['price'],
                    ];

                    if ($category) {
                        $masterUpdateData['category_name'] = $category->name;
                    }

                    if ($unit) {
                        $masterUpdateData['unit_name'] = $unit->name;
                    }

                    $this->masterProductRepository->update($masterProduct, $masterUpdateData);
                } else {
                    $this->masterProductRepository->create([
                        'name' => $data['name'],
                        'barcode' => $data['barcode'],
                        'cost_price' => $data['cost_price'],
                        'price' => $data['price'],
                        'category_name' => $category?->name,
                        'unit_name' => $unit?->name,
                    ]);
                }
            }

            DB::commit();

            return $createdProduct;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }

    public function bulkCreate(array $productsData): int
    {
        try {
            DB::beginTransaction();

            $insertData = Collection::make();
            $now = now();

            foreach ($productsData as $data) {
                if (isset($data['cost_price'], $data['price']) && $data['cost_price'] > $data['price']) {
                    throw new Exception(
                        trans('message.error.cost_price_greater_than_price_validation'),
                        Response::HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                // Generate SKU from product name if empty
                $sku = ! empty($data['sku'])
                    ? $data['sku']
                    : Str::of($data['name'])
                        ->headline()
                        ->replaceMatches('/[^A-Z]/', '').'-'.strtoupper(Str::random(8));

                if (! empty($data['barcode'])) {
                    $product = $this->productRepository->getByBarcode($data['barcode']);

                    if (isset($product)) {
                        throw new Exception(
                            sprintf(trans('message.error.product_with_barcode_exist'), $data['barcode']),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }
                }

                $imagePath = null;
                if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                    $fileName = Str::random(10).$data['image']->getClientOriginalName();
                    $data['image']->storeAs(Constants::PRODUCT_PUBLIC_PATH, $fileName, 'public');
                    $imagePath = Constants::PRODUCT_PUBLIC_PATH.$fileName;
                } elseif (isset($data['image']) && is_string($data['image'])) {
                    $imagePath = $data['image'];
                }

                $insertData->push([
                    'category_id' => $data['category_id'],
                    'unit_id' => $data['unit_id'],
                    'name' => $data['name'],
                    'sku' => $sku,
                    'barcode' => $data['barcode'] ?? null,
                    'is_active' => $data['is_active'] ?? Constants::TRUE_VALUE,
                    'is_unlimited' => $data['is_unlimited'] ?? Constants::FALSE_VALUE,
                    'desc' => $data['desc'] ?? Constants::EMPTY_STRING_VALUE,
                    'stock' => $data['stock'] ?? Constants::EMPTY_NUMBER_VALUE,
                    'image' => $imagePath,
                    'price' => $data['price'],
                    'cost_price' => $data['cost_price'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $isSuccess = $this->productRepository->insert($insertData->toArray());

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            DB::commit();

            return $insertData->count();
        } catch (\Throwable $th) {
            DB::rollBack();
            if ($th->getCode() === ErrorCode::SQL_UNIQUE_VIOLATION) {
                $th = new Exception(trans('message.error.duplicate_data_error_import'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            throw CheckException::Check($th);
        }
    }

    public function update(int $id, array $data): ?Product
    {
        DB::beginTransaction();

        try {
            $product = $this->productRepository->getById($id);

            if (! isset($product)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            if ($data['cost_price'] > $data['price']) {
                throw new Exception(
                    trans('message.error.cost_price_greater_than_price_validation'),
                    Response::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            // Generate new SKU if product name changed
            if ($data['name'] !== $product->name) {
                $data['sku'] = Str::of($data['name'])
                    ->headline()
                    ->replaceMatches('/[^A-Z]/', '').'-'.strtoupper(Str::random(8));
            }

            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }

                $fileName = Str::random(10).$data['image']->getClientOriginalName();
                $data['image']->storeAs(Constants::PRODUCT_PUBLIC_PATH, $fileName, 'public');
                $data['image'] = Constants::PRODUCT_PUBLIC_PATH.$fileName;
            }

            $isSuccess = $this->productRepository->update($product, $data);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $effectiveBarcode = $data['barcode'] ?? $product->barcode;

            if (! empty($effectiveBarcode)) {
                $masterProduct = $this->masterProductRepository->getByBarcode($effectiveBarcode);
                $categoryId = $data['category_id'] ?? $product->category_id;
                $unitId = $data['unit_id'] ?? $product->unit_id;

                $category = $categoryId ? $this->categoryRepository->getById((int) $categoryId) : null;
                $unit = $unitId ? $this->unitRepository->getById((int) $unitId) : null;

                if ($masterProduct) {
                    $masterUpdateData = [
                        'cost_price' => $data['cost_price'],
                        'price' => $data['price'],
                    ];

                    if ($category) {
                        $masterUpdateData['category_name'] = $category->name;
                    }

                    if ($unit) {
                        $masterUpdateData['unit_name'] = $unit->name;
                    }

                    $this->masterProductRepository->update($masterProduct, $masterUpdateData);
                } else {
                    $this->masterProductRepository->create([
                        'name' => $data['name'] ?? $product->name,
                        'barcode' => $effectiveBarcode,
                        'cost_price' => $data['cost_price'],
                        'price' => $data['price'],
                        'category_name' => $category?->name,
                        'unit_name' => $unit?->name,
                    ]);
                }
            }

            DB::commit();

            return $product;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw CheckException::Check($th);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $product = $this->productRepository->getById($id);

            if (! isset($product)) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $isSuccess = $this->productRepository->delete($product);

            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return true;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function bulkDelete(array $ids): int
    {
        try {
            $products = $this->productRepository->getByIds($ids);

            $ids = Collection::make($ids);

            $deletedCount = $this->productRepository->deleteMany($ids->toArray());

            if ($deletedCount == $ids->count()) {
                foreach ($products as $product) {
                    if ($product->image && Storage::disk('public')->exists($product->image)) {
                        Storage::disk('public')->delete($product->image);
                    }
                }
            }

            return $deletedCount;
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function importExcel(UploadedFile $file): int
    {
        try {
            $raws = Excel::toArray(new ProductImport, $file);

            $newData = Collection::make();

            $now = now();

            $getCategoryReqModel = new GetCategoryReqModel(new Request(['limit' => null]));
            $getUnitReqModel = new GetUnitReqModel(new Request(['limit' => null]));

            $categories = $this->categoryRepository->getAllByIndex($getCategoryReqModel);
            $units = $this->unitRepository->getAllByIndex($getUnitReqModel);

            DB::beginTransaction();
            foreach ($raws as $raw) {
                foreach ($raw as $row) {
                    if ($row['nama'] == null) {
                        break;
                    }
                    // setup category
                    $categoryName = $row['kategori'];
                    if ($categoryName == Constants::EMPTY_STRING_VALUE) {
                        throw new Exception(
                            trans('message.error.blank_category_template_validation'),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }
                    // check with case insensitive if category already exists
                    $category = $categories->first(function ($item) use ($categoryName) {
                        return strcasecmp($item->name, $categoryName) === 0;
                    });
                    if (! $category) {
                        $newCategory = $this->categoryRepository->create([
                            'name' => $categoryName,
                        ]);
                        $categoryId = $newCategory->id;
                        $categories->push($newCategory);
                    } else {
                        $categoryId = $category->id;
                    }

                    // setup unit
                    $unitName = $row['satuan'];
                    if ($unitName == Constants::EMPTY_STRING_VALUE) {
                        throw new Exception(
                            trans('message.error.blank_unit_template_validation'),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }
                    // check with case insensitive if unit already exists
                    $unit = $units->first(function ($item) use ($unitName) {
                        return strcasecmp($item->name, $unitName) === 0;
                    });
                    if (! $unit) {
                        $newUnit = $this->unitRepository->create([
                            'name' => $unitName,
                        ]);
                        $unitId = $newUnit->id;
                        $units->push($newUnit);
                    } else {
                        $unitId = $unit->id;
                    }

                    $isActive = $row['status'];
                    switch ($isActive) {
                        case Constants::ACTIVE_PRODUCT_TEMPLATE_VALUE:
                            $isActive = Constants::TRUE_VALUE;
                            break;
                        case Constants::INACTIVE_PRODUCT_TEMPLATE_VALUE:
                            $isActive = Constants::FALSE_VALUE;
                            break;
                        default:
                            $isActive = Constants::TRUE_VALUE;
                    }

                    $is_unlimited = $row['tipe_stok'];
                    switch ($is_unlimited) {
                        case Constants::UNLIMITED_TYPE_PRODUCT_TEMPLATE_VALUE:
                            $is_unlimited = Constants::TRUE_VALUE;
                            break;
                        case Constants::LIMITED_TYPE_PRODUCT_TEMPLATE_VALUE:
                            $is_unlimited = Constants::FALSE_VALUE;
                            break;
                        default:
                            $is_unlimited = Constants::FALSE_VALUE;
                    }

                    $newProduct = [
                        'name' => Str::upper($row['nama']),
                        'category_id' => $categoryId,
                        'unit_id' => $unitId,
                        'barcode' => $row['barcode_opsional'],
                        'stock' => $row['stok'] ?? Constants::EMPTY_NUMBER_VALUE,
                        'cost_price' => $row['harga_modal'] ?? Constants::EMPTY_NUMBER_VALUE,
                        'price' => $row['harga_jual'] ?? Constants::EMPTY_NUMBER_VALUE,
                        'is_active' => $isActive,
                        'is_unlimited' => $is_unlimited,
                        'desc' => $row['deskripsi_opsional'] ?? Constants::EMPTY_STRING_VALUE,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    if ($newProduct['name'] == Constants::EMPTY_STRING_VALUE) {
                        throw new Exception(
                            trans('message.error.blank_name_template_validation'),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    if ($newProduct['cost_price'] > $newProduct['price']) {
                        throw new Exception(
                            sprintf(trans('message.error.cost_price_greater_than_price_template_validaion'), $newProduct['name']),
                            Response::HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    // Generate SKU from product name
                    $newProduct['sku'] = Str::of($newProduct['name'])
                        ->headline()
                        ->replaceMatches('/[^A-Z]/', '').'-'.strtoupper(Str::random(8));

                    $newData->push($newProduct);
                }
            }

            $isSuccess = $this->productRepository->insert($newData->toArray());
            if (! $isSuccess) {
                throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }
            DB::commit();

            return $newData->count();
        } catch (\Throwable $th) {
            DB::rollback();
            if ($th->getCode() === ErrorCode::SQL_UNIQUE_VIOLATION) {
                $th = new Exception(trans('message.error.duplicate_data_error_import'), Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            throw CheckException::Check($th);
        }
    }

    public function exportExcel(): BinaryFileResponse
    {
        try {
            $request = new GetProductReqModel(new Request(['limit' => null]));
            $products = $this->productRepository->getAllByIndex($request);

            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();

            $sheet->fromArray([
                ['Nama', 'SKU', 'Barcode', 'Kategori', 'Satuan', 'Stok', 'Harga Modal', 'Harga Jual', 'Status', 'Tipe Stok', 'Deskripsi'],
            ], null, 'A1');

            $rows = [];
            foreach ($products as $product) {
                $rows[] = [
                    $product->name,
                    $product->sku,
                    $product->barcode,
                    $product->category?->name ?? Constants::EMPTY_STRING_VALUE,
                    $product->unit?->name ?? Constants::EMPTY_STRING_VALUE,
                    $product->stock,
                    $product->cost_price,
                    $product->price,
                    $product->is_active ? 'Aktif' : 'Tidak Aktif',
                    $product->is_unlimited ? 'Tidak Terbatas' : 'Terbatas',
                    $product->desc,
                ];
            }

            $sheet->fromArray($rows, null, 'A2');

            $temporaryFilePath = tempnam(sys_get_temp_dir(), 'products-export-').'.xlsx';
            $writer = new Xlsx($spreadsheet);
            $writer->save($temporaryFilePath);

            return response()->download($temporaryFilePath, 'products-export.xlsx')->deleteFileAfterSend(true);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function exportPdf(): BinaryFileResponse
    {
        try {
            $request = new GetProductReqModel(new Request(['limit' => null]));
            $products = $this->productRepository->getAllByIndex($request);

            $temporaryFilePath = tempnam(sys_get_temp_dir(), 'products-export-').'.pdf';

            Pdf::loadView('exports.products-pdf', ['products' => $products])
                ->setPaper('a4', 'landscape')
                ->save($temporaryFilePath);

            return response()->download($temporaryFilePath, 'products-export.pdf')->deleteFileAfterSend(true);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }

    public function printBarcode(int|string $id, int $quantity): BinaryFileResponse
    {
        try {
            $product = $this->productRepository->getById((int) $id);

            if (! $product) {
                throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
            }

            if (empty($product->barcode)) {
                throw new Exception(trans('message.error.barcode_not_found'), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $barcodeHtml = BarcodeGenerator::generateHtml($product->barcode);

            $temporaryFilePath = tempnam(sys_get_temp_dir(), 'product-barcode-').'.pdf';

            Pdf::loadView('pdf.barcode', [
                'product' => $product,
                'quantity' => $quantity,
                'barcodeHtml' => $barcodeHtml,
            ])
                ->setPaper('a4', 'portrait')
                ->save($temporaryFilePath);

            return response()->download($temporaryFilePath, "barcode-{$product->barcode}.pdf")->deleteFileAfterSend(true);
        } catch (\Throwable $th) {
            throw CheckException::Check($th);
        }
    }
}
