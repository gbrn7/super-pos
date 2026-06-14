<?php

namespace App\Support\Models\Product;

use Illuminate\Http\Request;

class GetProductReqModel
{
    public ?string $name;

    public ?int $category_id;

    public ?int $unit_id;

    public ?int $price;

    public ?int $cost_price;

    public ?int $sku;

    public ?int $page;

    public ?string $order_by;

    public ?string $order;

    public ?int $limit;

    public ?bool $is_active;

    public ?bool $is_unlimited;

    public ?bool $is_stock_available;

    public ?string $field;

    public ?string $keyword;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->price = $request->query('price');
        $this->cost_price = $request->query('cost_price');
        $this->category_id = $request->query('category_id');
        $this->sku = $request->query('sku');
        $this->unit_id = $request->query('unit_id');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
        $this->is_active = $request->query('is_active');
        $this->is_unlimited = $request->query('is_unlimited');
        $this->field = $request->query('field');
        $this->keyword = $request->query('keyword');
        $this->is_stock_available = $request->query('is_stock_available');
    }
}
