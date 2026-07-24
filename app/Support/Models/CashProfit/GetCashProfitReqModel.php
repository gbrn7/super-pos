<?php

namespace App\Support\Models\CashProfit;

use Illuminate\Http\Request;

class GetCashProfitReqModel
{
    public ?int $user_id;

    public ?int $payment_method_id;

    public ?string $start_date;

    public ?string $end_date;

    public ?string $keyword;

    public ?int $page;

    public ?int $limit;

    public ?string $order_by;

    public ?string $order;

    public function __construct(Request $request)
    {
        $this->user_id = $request->query('user_id') ? (int) $request->query('user_id') : null;
        $this->payment_method_id = $request->query('payment_method_id') ? (int) $request->query('payment_method_id') : null;
        $this->start_date = $request->query('start_date');
        $this->end_date = $request->query('end_date');
        $this->keyword = $request->query('keyword');
        $this->page = $request->query('page') ? (int) $request->query('page') : 1;
        $this->limit = $request->query('limit') ? (int) $request->query('limit') : 10;
        $this->order_by = $request->query('order_by');
        $this->order = $request->query('order');
    }
}
