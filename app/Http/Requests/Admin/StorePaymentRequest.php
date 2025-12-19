<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'bill_id' => ['required', 'string', 'exists:student_billing,bill_id'],
            'student_id' => ['required', 'string', 'exists:students,id'],
            'payment_date' => ['required', 'date'],
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'in:Cash,Bank,Mobile Money'],
            'transaction_reference' => ['nullable', 'string', 'max:255', 'unique:payments,transaction_reference'],
            'received_by' => ['nullable', 'uuid', 'exists:users,id'],
        ];
    }
}

