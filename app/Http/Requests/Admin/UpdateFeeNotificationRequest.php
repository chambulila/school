<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeeNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'bill_id' => ['required', 'string', 'exists:student_billing,bill_id'],
            'message' => ['required', 'string', 'max:1000'],
            'sent_at' => ['nullable', 'date'],
        ];
    }
}

