<?php

namespace App\Support\Models\CapitalWallet;

use Illuminate\Http\Request;

class GetCapitalWalletTransactionReqModel
{
    public ?string $start_date;

    public ?string $end_date;

    public ?string $type;

    public ?string $transaction_type;

    public ?string $keyword;

    public ?int $page;

    public ?int $limit;

    public function __construct(Request $request)
    {
        $this->start_date = $request->query('start_date') !== null && $request->query('start_date') !== '' ? (string) $request->query('start_date') : null;
        $this->end_date = $request->query('end_date') !== null && $request->query('end_date') !== '' ? (string) $request->query('end_date') : null;
        $this->type = $request->query('type');
        $this->transaction_type = $request->query('transaction_type');
        $this->keyword = $request->query('keyword');
        $this->page = $request->query('page') ? (int) $request->query('page') : null;
        $this->limit = $request->query('limit') ? (int) $request->query('limit') : null;
    }
}
