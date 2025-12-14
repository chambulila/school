<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'employee_number' => ['required', 'string', 'max:50', 'unique:teachers,employee_number'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
        ];
    }
}

