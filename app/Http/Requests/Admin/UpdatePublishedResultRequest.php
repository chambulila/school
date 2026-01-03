<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePublishedResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('publish-exam-results') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('publishedResult');
        $id = is_object($param) ? ($param->getKey() ?? $param->id ?? null) : $param;
        $scope = $this->input('publish_scope');

        return [
            'publish_scope' => ['required', Rule::in(['exam', 'grade', 'section', 'subject'])],
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'grade_id' => ['nullable', 'uuid', 'exists:grades,id'],
            'class_section_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
            'subject_id' => ['nullable', 'uuid', 'exists:subjects,id'],
            'published_at' => ['nullable', 'date'],
            'notification_sent' => ['nullable', 'boolean'],
            'unique_scope' => [
                Rule::unique('published_results')->ignore($id, 'id')->where(function ($q) {
                    $q->where('exam_id', $this->input('exam_id'));
                    $classSectionId = $this->input('class_section_id');
                    $subjectId = $this->input('subject_id');
                    if ($classSectionId) {
                        $q->where('class_section_id', $classSectionId);
                    } else {
                        $q->whereNull('class_section_id');
                    }
                    if ($subjectId) {
                        $q->where('subject_id', $subjectId);
                    } else {
                        $q->whereNull('subject_id');
                    }
                    return $q;
                }),
            ],
        ];
    }
}
