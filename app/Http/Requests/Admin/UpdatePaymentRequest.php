<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('payment');
        $id = is_object($param) ? ($param->getKey() ?? $param->payment_id ?? $param->id ?? null) : $param;

        return [
            'bill_id' => ['required', 'string', 'exists:student_billing,bill_id'],
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'payment_date' => ['required', 'date'],
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'in:Cash,Bank,Mobile Money'],
            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('payments', 'transaction_reference')->ignore($id, 'payment_id'),
            ],
            'received_by' => ['nullable', 'uuid', 'exists:users,id'],
        ];
    }
}

