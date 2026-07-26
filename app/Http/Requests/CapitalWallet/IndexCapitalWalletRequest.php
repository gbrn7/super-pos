<?php

namespace App\Http\Requests\CapitalWallet;

use Illuminate\Foundation\Http\FormRequest;

class IndexCapitalWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'numeric'],
            'end_date' => ['nullable', 'numeric'],
            'type' => ['nullable', 'in:in,out'],
            'transaction_type' => ['nullable', 'in:sales_capital_recovery,reinvestment,capital_injection,capital_drawdown,product_purchase'],
            'keyword' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
