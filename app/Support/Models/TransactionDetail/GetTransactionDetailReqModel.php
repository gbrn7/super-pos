<?php

namespace App\Support\Models\TransactionDetail;

use Illuminate\Http\Request;

class GetTransactionDetailReqModel
{
    public ?int $transaction_id;

    public ?int $product_id;

    public ?string $unit_name;

    public ?string $keyword;

    public ?string $field;

    public ?int $page;

    public ?int $limit;

    public ?string $order_by;

    public ?string $order;

    public function __construct(Request $request)
    {
        $this->transaction_id = $request->query('transaction_id');
        $this->product_id = $request->query('product_id');
        $this->unit_name = $request->query('unit_name');
        $this->keyword = $request->query('keyword');
        $this->field = $request->query('field');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
