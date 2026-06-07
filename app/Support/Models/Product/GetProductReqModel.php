<?php

namespace App\Support\Models\Product;

use Illuminate\Http\Request;

class GetProductReqModel
{
    public ?string $name;

    public ?int $category_id;

    public ?int $unit_id;

    public ?int $sku;

    public ?int $page;

    public ?string $order_by;

    public ?string $order;

    public ?int $limit;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->category_id = $request->query('category_id');
        $this->sku = $request->query('sku');
        $this->unit_id = $request->query('unit_id');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
