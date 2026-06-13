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
            ->with(['category', 'unit'])
            ->orderBy($request->order_by != '' ? $request->order_by : 'id', $request->order_by != '' ? $request->order_by : 'desc')
            ->when($request->name, fn($query) => $query->where('name', 'like', "%{$request->name}%"))
            ->when($request->sku, fn($query) => $query->where('sku', 'like', "%{$request->sku}%"))
            ->when($request->is_active, fn($query) => $query->where('is_active', $request->is_active))
            ->when($request->is_unlimited, fn($query) => $query->where('is_unlimited', $request->is_unlimited))
            ->when($request->category_id, fn($query) => $query->where('category_id', $request->category_id))
            ->when($request->unit_id, fn($query) => $query->where('unit_id', $request->unit_id))
            ->when($request->price, fn($query) => $query->where('price', $request->price))
            ->when($request->cost_price, fn($query) => $query->where('cost_price', $request->cost_price));

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
