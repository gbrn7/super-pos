<?php

namespace App\Http\Requests\PaymentMethod;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentMethodRequest extends FormRequest
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
            'name' => ['string', 'required', 'max:255'],
            'desc' => ['string', 'nullable', 'max:255'],
            'image' => ['nullable', 'mimes:jpg,png,jpeg,gif,svg', 'max:1028'],
        ];
    }
}
