<?php

namespace App\Support\Models\Transaction;

use Illuminate\Http\Request;

class GetTransactionReqModel
{
    public ?string $invoice_number;

    public ?int $user_id;

    public ?int $payment_method_id;

    public ?string $start_date;

    public ?string $end_date;

    public ?string $keyword;

    public ?string $field;

    public ?int $page;

    public ?int $limit;

    public ?string $order_by;

    public ?string $order;

    public function __construct(Request $request)
    {
        $this->invoice_number = $request->query('invoice_number');
        $this->user_id = $request->query('user_id');
        $this->payment_method_id = $request->query('payment_method_id') ? (int) $request->query('payment_method_id') : null;
        $this->start_date = $request->query('start_date');
        $this->end_date = $request->query('end_date');
        $this->keyword = $request->query('keyword');
        $this->field = $request->query('field');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
