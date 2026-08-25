<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class PurgeDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(\App\Support\Enums\RoleEnums::SUPER_ADMIN->value);
    }

    public function rules(): array
    {
        return [
            'modules' => ['required', 'array', 'min:1'],
            'modules.*' => ['required', 'string', 'in:transactions,returns,profit_wallet,capital_wallet'],
            'retention_period' => ['required', 'string', 'in:1_month,3_months,6_months,12_months'],
            'password' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (! Hash::check($value, $this->user()->password)) {
                        $fail(__('validation.current_password'));
                    }
                },
            ],
        ];
    }
}
