<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeeCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_name' => ['required', 'string', 'max:100', 'unique:fee_categories,category_name'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}

