<?php

namespace App\Services;

use App\Http\Resources\ProductResource;
use App\Imports\ProductImport;
use App\Models\Product;
use App\Support\Constants\Constants;
use App\Support\Constants\ErrorCode;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Interfaces\Services\ProductServiceInterface;
use App\Support\Models\Product\GetProductReqModel;
use App\Support\Utils\CheckException;
use App\Support\Utils\PaginationResource;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

use function Illuminate\Log\log;

class ProductService implements ProductServiceInterface
{
  public function __construct(protected ProductRepositoryInterface $productRepository) {}

  public function getAllByIndex(GetProductReqModel $request): Paginator|Collection
  {
    try {
      return $this->productRepository->getAllByIndex($request);
    } catch (\Throwable $th) {
      log($th->getMessage());
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

  public function create(array $data): Product
  {
    try {
      $isProductExist = $this->productRepository->getByName($data['name']);

      if (isset($isProductExist)) {
        throw new Exception(trans('message.error.data_already_exists'), Response::HTTP_UNPROCESSABLE_ENTITY);
      }

      // Generate SKU from product name
      $data['sku'] = Str::of($data['name'])
        ->headline()
        ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8));

      if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
        $fileName = Str::random(10) . $data['image']->getClientOriginalName();
        $data['image']->storeAs(Constants::PRODUCT_PUBLIC_PATH, $fileName, 'public');
        $data['image'] = Constants::PRODUCT_PUBLIC_PATH . $fileName;
      }

      return $this->productRepository->create($data);
    } catch (\Throwable $th) {
      throw CheckException::Check($th);
    }
  }

  public function update(int $id, array $data): ?Product
  {
    try {
      $product = $this->productRepository->getById($id);

      if (! isset($product)) {
        throw new Exception(trans('message.error.data_not_found'), Response::HTTP_NOT_FOUND);
      }

      // Generate new SKU if product name changed
      if ($data['name'] !== $product->name) {
        $data['sku'] = Str::of($data['name'])
          ->headline()
          ->replaceMatches('/[^A-Z]/', '') . '-' . strtoupper(Str::random(8));
      }

      if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
        if ($product->image && Storage::disk('public')->exists($product->image)) {
          Storage::disk('public')->delete($product->image);
        }

        $fileName = Str::random(10) . $data['image']->getClientOriginalName();
        $data['image']->storeAs(Constants::PRODUCT_PUBLIC_PATH, $fileName, 'public');
        $data['image'] = Constants::PRODUCT_PUBLIC_PATH . $fileName;
      }

      $isSuccess = $this->productRepository->update($product, $data);

      if (! $isSuccess) {
        throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
      }

      return $product;
    } catch (\Throwable $th) {
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
      $products = Product::whereIn('id', $ids)->get();

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

      $unixTime = Carbon::now()->unix();

      foreach ($raws as $raw) {
        foreach ($raw as $row) {

          $newData->push([
            'category_id' => $row['category_id'],
            'unit_id' => $row['unit_id'],
            'name' => $row['name'],
            'is_active' => $row['is_active'] ?? 1,
            'stock' => $row['stock'] ?? 0,
            'price' => $row['price'],
            'cost_price' => $row['cost_price'],
            'created_at' => $unixTime,
            'updated_at' => $unixTime,
          ]);
        }
      }

      $isSuccess = $this->productRepository->insert($newData->toArray());
      if (! $isSuccess) {
        throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);
      }

      return $newData->count();
    } catch (\Throwable $th) {

      if ($th->getCode() === ErrorCode::SQL_UNIQUE_VIOLATION) {
        $th = new Exception(trans('message.error.duplicate_data_error_import'), Response::HTTP_INTERNAL_SERVER_ERROR);
      }

      throw CheckException::Check($th);
    }
  }
}
