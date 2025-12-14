<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grade' => ['nullable', 'string', 'max:2'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'student_subject_exam_unique' => [
                Rule::unique('exam_results')->where(function ($q) {
                    return $q->where('student_id', $this->input('student_id'))
                        ->where('subject_id', $this->input('subject_id'))
                        ->where('exam_id', $this->input('exam_id'));
                }),
            ],
        ];
    }
}

