<?php

namespace App\Http\Requests\TransactionDetail;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionDetailRequest extends FormRequest
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
            'transaction_id' => ['sometimes', 'required', 'integer', 'exists:transactions,id'],
            'product_id' => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'unit_name' => ['sometimes', 'required', 'string', 'max:255'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:1'],
            'cost_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
        ];
    }
}
