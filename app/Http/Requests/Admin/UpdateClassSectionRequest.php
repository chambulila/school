<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClassSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('edit-section') ?? false;
    }

    public function rules(): array
    {
        $sectionParam = $this->route('section');
        $sectionId = is_object($sectionParam) ? ($sectionParam->getKey() ?? $sectionParam->id ?? null) : $sectionParam;
        $gradeId = $this->input('grade_id');

        return [
            'grade_id' => ['required', 'uuid', 'exists:grades,id'],
            'section_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('class_sections', 'section_name')
                    ->where(fn ($q) => $q->where('grade_id', $gradeId))
                    ->ignore($sectionId, 'id'),
            ],
            'class_teacher_id' => ['nullable', 'uuid', 'exists:teachers,id'],
        ];
    }
}
