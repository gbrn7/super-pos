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

    public ?string $start_date;

    public ?string $end_date;

    public function __construct(Request $request)
    {
        $this->page = $request->query('page') !== null ? (int) $request->query('page') : null;
        $this->limit = $request->query('limit') !== null ? (int) $request->query('limit') : 10;
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
        $this->keyword = $request->query('keyword');
        $this->field = $request->query('field');
        $this->start_date = $request->query('start_date') !== null ? (string) $request->query('start_date') : null;
        $this->end_date = $request->query('end_date') !== null ? (string) $request->query('end_date') : null;
    }
}
