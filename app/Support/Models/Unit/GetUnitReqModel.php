<?php

namespace App\Support\Models\Unit;

use Illuminate\Http\Request;

class GetUnitReqModel
{
    public ?string $name;

    public ?int $page;

    public ?int $limit;

    public ?string $order_by;

    public ?string $order;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
