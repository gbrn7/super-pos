<?php

namespace App\Http\Requests\Transaction;

use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'invoice_number' => ['required', 'string', 'max:255', Rule::unique(Transaction::class)],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'payment_amount' => ['required', 'numeric', 'min:0'],
            'change_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
