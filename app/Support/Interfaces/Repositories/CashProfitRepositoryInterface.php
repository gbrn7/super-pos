<?php

namespace App\Support\Interfaces\Repositories;

use App\Support\Models\CashProfit\GetCashProfitReqModel;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface CashProfitRepositoryInterface
{
    public function getAllByIndex(GetCashProfitReqModel $request): Paginator|Collection;

    public function getSummary(GetCashProfitReqModel $request): array;
}
