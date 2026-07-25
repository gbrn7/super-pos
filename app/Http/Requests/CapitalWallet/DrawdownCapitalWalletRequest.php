<?php

namespace App\Http\Requests\CapitalWallet;

use Illuminate\Foundation\Http\FormRequest;

class DrawdownCapitalWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
