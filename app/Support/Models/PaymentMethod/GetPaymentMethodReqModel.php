<?php

namespace App\Support\Models\PaymentMethod;

use Illuminate\Http\Request;

class GetPaymentMethodReqModel
{
    public ?string $name;

    public ?int $page;

    public ?int $limit;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
    }
}
