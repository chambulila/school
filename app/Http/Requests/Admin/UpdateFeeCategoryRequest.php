<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeeCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_name' => ['required', 'string', 'max:100', 'unique:fee_categories,category_name,'.$this->route('feeCategory')->fee_category_id.',fee_category_id'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}

