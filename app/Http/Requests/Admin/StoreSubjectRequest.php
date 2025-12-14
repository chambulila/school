<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'subject_name' => ['required', 'string', 'max:100'],
            'subject_code' => ['required', 'string', 'max:50', 'unique:subjects,subject_code'],
            'grade_id' => ['nullable', 'uuid', 'exists:grades,id'],
        ];
    }
}

