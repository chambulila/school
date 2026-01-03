<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-grade') ?? false;
    }

    public function rules(): array
    {
        return [
            'grade_name' => ['required', 'string', 'max:100', 'unique:grades,grade_name'],
        ];
    }
}

