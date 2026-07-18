<?php

namespace App\Http\Requests\Transaction;

use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
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
        $id = $this->route('transaction') ?? $this->route('id');

        return [
            'user_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'payment_method_name' => ['sometimes', 'required', 'string', 'max:255'],
            'invoice_number' => ['sometimes', 'required', 'string', 'max:255', Rule::unique(Transaction::class)->ignore($id)],
            'total_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'payment_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'change_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
        ];
    }
}
