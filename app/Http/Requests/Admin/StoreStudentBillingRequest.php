<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentBillingRequest extends FormRequest
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
            'fee_structure_id' => ['nullable', 'uuid', 'exists:fee_structures,fee_structure_id'],
            'fee_structure_ids' => ['nullable', 'array'],
            'fee_structure_ids.*' => ['uuid', 'exists:fee_structures,fee_structure_id'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:unpaid,partial,paid'],
            'issued_date' => ['nullable', 'date'],
        ];
    }
}

