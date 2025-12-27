<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('student');
        $id = is_object($param) ? ($param->getKey() ?? $param->id ?? null) : $param;
        $userId = is_object($param) ? ($param->user_id ?? null) : null;

        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $userId . ',id'],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'in:male,female'],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'admission_number' => ['required', 'string', 'max:50', 'unique:students,admission_number,' . $id . ',id'],
            'admission_date' => ['nullable', 'date'],
            'current_class_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
            'academic_year_id' => ['nullable', 'exists:academic_years,id'],
        ];
    }
}
