<?php

namespace App\Repositories;

use App\Models\Product;
use App\Support\Interfaces\Repositories\ProductRepositoryInterface;
use App\Support\Models\Product\GetProductReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function getAllByIndex(GetProductReqModel $request): Paginator|Collection
    {
        $query = Product::query()
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('units', 'products.unit_id', '=', 'units.id')
            ->when($request->keyword, function ($query) use ($request) {
                if ($request->field === 'category') {
                    $query->where('categories.name', 'ilike', "%{$request->keyword}%");
                } else if ($request->field === 'unit') {
                    $query->where('units.name', 'ilike', "%{$request->keyword}%");
                } else if (isset($request->field) && $request->field != 'default') {
                    $query->where('products.' . $request->field, 'ilike', "%{$request->keyword}%");
                } else {
                    $query
                        ->orwhere('products.name', 'ilike', "%{$request->keyword}%")
                        ->orwhere('products.barcode', 'ilike', "%{$request->keyword}%")
                        ->orWhere('products.sku', 'ilike', "%{$request->keyword}%")
                        ->orWhere('categories.name', 'ilike', "%{$request->keyword}%")
                        ->orWhere('units.name', 'ilike', "%{$request->keyword}%");
                }
            })
            ->when($request->name, fn($query) => $query->where('products.name', 'ilike', "%{$request->name}%"))
            ->when($request->barcode, fn($query) => $query->where('products.barcode', 'ilike', "%{$request->barcode}%"))
            ->when($request->sku, fn($query) => $query->where('products.sku', 'ilike', "%{$request->sku}%"))
            ->when($request->category_id, fn($query) => $query->where('products.category_id', $request->category_id))
            ->when($request->unit_id, fn($query) => $query->where('products.unit_id', $request->unit_id))
            ->when($request->price, fn($query) => $query->where('products.price', $request->price))
            ->when(isset($request->is_stock_available), function ($query) use ($request) {
                if ($request->is_stock_available) {
                    $query->where('products.stock', '>', 0);
                } else {
                    $query->where('products.stock',  0);
                }
            })
            ->when(isset($request->is_active), function ($query) use ($request) {
                if ($request->is_active) {
                    $query->where('products.is_active', true);
                } else {
                    $query->where('products.is_active',  false);
                }
            })
            ->when(isset($request->is_unlimited), function ($query) use ($request) {
                if ($request->is_unlimited) {
                    $query->where('products.is_unlimited', true);
                } else {
                    $query->where('products.is_unlimited',  false);
                }
            })
            ->when($request->cost_price, fn($query) => $query->where('products.cost_price', $request->cost_price))
            ->select('products.*');

        if (isset($request->order_by) && isset($request->order)) {
            if ($request->order_by == 'category') {
                $query->orderBy('categories.name', $request->order);
            } else if ($request->order_by == 'unit') {
                $query->orderBy('units.name', $request->order);
            } else {
                $query->orderBy('products.' . $request->order_by, $request->order);
            }
        } else {
            $query->orderBy('products.id', 'desc');
        }

        if ($request->limit === null) {
            return $query->get();
        }

        return $query->paginate($request->limit)->onEachSide(1);
    }

    public function getById(int $id): ?Product
    {
        return Product::find($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): bool
    {
        return $product->update($data);
    }

    public function delete(Product $product): bool
    {
        return $product->delete();
    }

    public function deleteMany(array $ids): int
    {
        return Product::destroy($ids);
    }

    public function insert(array $data): bool
    {
        return Product::insert($data);
    }

    public function getByName(string $name): ?Product
    {
        return Product::where('name', $name)->first();
    }
}
