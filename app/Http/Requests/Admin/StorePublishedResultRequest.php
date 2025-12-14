<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublishedResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'class_section_id' => ['required', 'uuid', 'exists:class_sections,id'],
            'published_at' => ['nullable', 'date'],
            'notification_sent' => ['nullable', 'boolean'],
            'exam_section_unique' => [
                Rule::unique('published_results')->where(function ($q) {
                    return $q->where('exam_id', $this->input('exam_id'))
                        ->where('class_section_id', $this->input('class_section_id'));
                }),
            ],
        ];
    }
}

