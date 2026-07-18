<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class BulkStoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'products' => ['required', 'array', 'min:1'],
            'products.*.category_id' => ['required', 'integer', 'exists:categories,id'],
            'products.*.unit_id' => ['required', 'integer', 'exists:units,id'],
            'products.*.name' => ['required', 'string', 'max:255'],
            'products.*.is_active' => ['nullable', 'boolean'],
            'products.*.is_unlimited' => ['nullable', 'boolean'],
            'products.*.stock' => ['nullable', 'integer', 'min:0'],
            'products.*.price' => ['required', 'numeric', 'min:0'],
            'products.*.cost_price' => ['required', 'numeric', 'min:0'],
            'products.*.image' => ['nullable'],
            'products.*.desc' => ['nullable', 'string'],
            'products.*.barcode' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'products.*.category_id.exists' => trans('validation.exists'),
            'products.*.unit_id.exists' => trans('validation.exists'),
        ];
    }
}
