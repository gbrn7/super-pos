<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
      'category_id' => ['required', 'integer', 'exists:categories,id'],
      'unit_id' => ['required', 'integer', 'exists:units,id'],
      'name' => ['required', 'string', 'max:255'],
      'is_active' => ['boolean', 'nullable'],
      'stock' => ['integer', 'nullable', 'min:0'],
      'price' => ['required', 'numeric', 'min:0'],
      'cost_price' => ['required', 'numeric', 'min:0'],
      'image' => ['nullable', 'mimes:jpg,png,jpeg,gif,svg', 'max:1024'],
    ];
  }

  /**
   * Get custom validation messages.
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'category_id.exists' => trans('validation.exists'),
      'unit_id.exists' => trans('validation.exists'),
    ];
  }
}
