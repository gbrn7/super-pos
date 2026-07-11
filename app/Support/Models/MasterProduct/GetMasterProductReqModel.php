<?php

namespace App\Support\Models\MasterProduct;

use Illuminate\Http\Request;

class GetMasterProductReqModel
{
    public ?string $name;

    public ?string $barcode;

    public ?int $category_name;

    public ?int $unit_name;

    public ?int $price;

    public ?int $cost_price;

    public ?int $page;

    public ?string $order_by;

    public ?string $order;

    public ?int $limit;

    public ?string $field;

    public ?string $keyword;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->barcode = $request->query('barcode');
        $this->price = $request->query('price');
        $this->cost_price = $request->query('cost_price');
        $this->category_name = $request->query('category_name');
        $this->unit_name = $request->query('unit_name');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
        $this->field = $request->query('field');
        $this->keyword = $request->query('keyword');
    }
}
