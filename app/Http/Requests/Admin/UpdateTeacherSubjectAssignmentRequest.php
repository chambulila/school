<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherSubjectAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('teacherSubjectAssignment');
        $id = is_object($param) ? ($param->getKey() ?? $param->id ?? null) : $param;

        return [
            'teacher_id' => ['required', 'uuid', 'exists:teachers,id'],
            'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'teacher_id_unique' => [
                Rule::unique('teacher_subject_assignments', 'teacher_id')
                    ->ignore($id, 'id')
                    ->where(function ($q) {
                        return $q->where('subject_id', $this->input('subject_id'))
                            ->where('class_section_id', $this->input('class_section_id'));
                    }),
            ],
        ];
    }
}

