<?php

namespace App\Http\Requests\ProfitWallet;

use Illuminate\Foundation\Http\FormRequest;

class IndexProfitWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'string'],
            'end_date' => ['nullable', 'string'],
            'type' => ['nullable', 'in:in,out'],
            'transaction_type' => ['nullable', 'in:sales_profit,disbursement,capital_withdrawal'],
            'keyword' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
