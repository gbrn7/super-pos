<?php

namespace App\Http\Requests\TransactionDetail;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionDetailRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'transaction_id' => ['required', 'integer', 'exists:transactions,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'unit_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
