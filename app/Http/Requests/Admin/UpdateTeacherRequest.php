<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('teacher');
        $id = is_object($param) ? ($param->getKey() ?? $param->id ?? null) : $param;

        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'employee_number' => ['required', 'string', 'max:50', 'unique:teachers,employee_number,' . $id . ',id'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
        ];
    }
}

