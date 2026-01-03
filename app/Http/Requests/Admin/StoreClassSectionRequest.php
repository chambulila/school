<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-section') ?? false;
    }

    public function rules(): array
    {
        return [
            'grade_id' => ['required', 'uuid', 'exists:grades,id'],
            'section_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('class_sections', 'section_name')->where(fn ($q) => $q->where('grade_id', $this->input('grade_id'))),
            ],
            'class_teacher_id' => ['nullable', 'uuid', 'exists:teachers,id'],
        ];
    }
}
