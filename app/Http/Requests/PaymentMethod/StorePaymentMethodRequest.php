<?php

namespace App\Http\Requests\PaymentMethod;

use App\Models\PaymentMethod;
use App\Models\Unit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentMethodRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', Rule::unique(PaymentMethod::class)],
            'desc' => ['string', 'nullable', 'max:255'],
            'image' => ['nullable', 'mimes:jpg,png,jpeg,gif,svg', 'max:1028'],
        ];
    }
}
