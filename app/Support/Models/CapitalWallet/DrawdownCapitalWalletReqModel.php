<?php

namespace App\Support\Models\CapitalWallet;

use Illuminate\Http\Request;

class DrawdownCapitalWalletReqModel
{
    public float $amount;

    public ?string $notes;

    public function __construct(Request $request)
    {
        $this->amount = (float) $request->input('amount');
        $this->notes = $request->input('notes');
    }
}
