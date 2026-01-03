<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublishedResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('publish-exam-results') ?? false;
    }

    public function rules(): array
    {
        $scope = $this->input('publish_scope');

        $rules = [
            'publish_scope' => ['required', Rule::in(['exam', 'grade', 'section', 'subject'])],
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'published_at' => ['nullable', 'date'],
            'notification_sent' => ['nullable', 'boolean'],
            'grade_id' => ['nullable', 'uuid', 'exists:grades,id'],
            'class_section_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
            'subject_id' => ['nullable', 'uuid', 'exists:subjects,id'],
        ];

        if ($scope === 'grade') {
            $rules['grade_id'] = ['required', 'uuid', 'exists:grades,id'];
        } elseif ($scope === 'section') {
            $rules['class_section_id'] = ['required', 'uuid', 'exists:class_sections,id'];
        } elseif ($scope === 'subject') {
            $rules['class_section_id'] = ['required', 'uuid', 'exists:class_sections,id'];
            $rules['subject_id'] = ['required', 'uuid', 'exists:subjects,id'];
        }

        return $rules;
    }
}
