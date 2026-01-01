<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentBillingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'academic_year_id' => ['required', 'uuid', 'exists:academic_years,id'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:pending,partially_paid,fully_paid'],
            'created_at' => ['nullable', 'date'],
        ];
    }
}

