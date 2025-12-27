<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('studentEnrollment');
        $id = is_object($param) ? ($param->getKey() ?? $param->id ?? null) : $param;

        return [
            'student_id' => [
                'required', 
                'uuid', 
                'exists:students,id',
                Rule::unique('student_enrollments', 'student_id')
                    ->ignore($id, 'id')
                    ->where(function ($q) {
                        return $q->where('academic_year_id', $this->input('academic_year_id'));
                    }),
            ],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'enrollment_date' => ['nullable', 'date'],
        ];
    }
}

