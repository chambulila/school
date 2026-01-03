<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-student') ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'uuid', 'exists:users,id', 'required_without:first_name'],
            'first_name' => ['required_without:user_id', 'string', 'max:100'],
            'last_name' => ['required_without:user_id', 'string', 'max:100'],
            'email' => ['required_without:user_id', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required_without:user_id', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'in:male,female'],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'admission_number' => ['required', 'string', 'max:50', 'unique:students,admission_number'],
            'admission_date' => ['nullable', 'date'],
            'current_class_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
            'class_section_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
            'academic_year_id' => ['required_with:current_class_id,class_section_id', 'nullable', 'uuid', 'exists:academic_years,id'],
        ];
    }
}
