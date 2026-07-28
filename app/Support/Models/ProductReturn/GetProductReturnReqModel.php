<?php

namespace App\Support\Models\ProductReturn;

use Illuminate\Http\Request;

class GetProductReturnReqModel
{
    public ?int $page;

    public ?int $limit;

    public ?string $order_by;

    public ?string $order;

    public ?string $keyword;

    public ?string $field;

    public function __construct(Request $request)
    {
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
        $this->keyword = $request->query('keyword');
        $this->field = $request->query('field');
    }
}
