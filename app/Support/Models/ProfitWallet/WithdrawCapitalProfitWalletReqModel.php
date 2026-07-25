<?php

namespace App\Support\Models\ProfitWallet;

use Illuminate\Http\Request;

class WithdrawCapitalProfitWalletReqModel
{
    public float $amount;

    public ?string $notes;

    public function __construct(Request $request)
    {
        $this->amount = (float) $request->input('amount');
        $this->notes = $request->input('notes');
    }
}
