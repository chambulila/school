<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentSessionAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-students-attendance') ?? false;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'period' => ['nullable', 'string'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'uuid', 'exists:students,id'],
            'records.*.status' => ['required', 'in:Present,Absent,Late,Excused'],
            'records.*.remarks' => ['nullable', 'string'],
        ];
    }
}

