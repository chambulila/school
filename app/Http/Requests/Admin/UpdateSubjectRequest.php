<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('subject');
        $id = is_object($param) ? ($param->getKey() ?? $param->id ?? null) : $param;

        return [
            'subject_name' => ['required', 'string', 'max:100'],
            'subject_code' => ['required', 'string', 'max:50', 'unique:subjects,subject_code,' . $id . ',id'],
            'grade_id' => ['nullable', 'uuid', 'exists:grades,id'],
        ];
    }
}

