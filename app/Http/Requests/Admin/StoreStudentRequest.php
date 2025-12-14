<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'admission_number' => ['required', 'string', 'max:50', 'unique:students,admission_number'],
            'admission_date' => ['nullable', 'date'],
            'current_class_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
        ];
    }
}

