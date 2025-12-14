<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'enrollment_date' => ['nullable', 'date'],
            'student_id_unique' => [
                Rule::unique('student_enrollments', 'student_id')->where(function ($q) {
                    return $q->where('academic_year_id', $this->input('academic_year_id'));
                }),
            ],
        ];
    }
}

