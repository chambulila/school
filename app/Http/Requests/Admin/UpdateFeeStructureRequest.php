<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'fee_category_id' => ['required', 'string', 'exists:fee_categories,fee_category_id'],
            'grade_id' => ['required', 'uuid', 'exists:grades,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
        ];
    }
}

