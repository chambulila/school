<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        $param = $this->route('paymentReceipt');
        $id = is_object($param) ? ($param->getKey() ?? $param->receipt_id ?? $param->id ?? null) : $param;

        return [
            'payment_id' => ['required', 'string', 'exists:payments,payment_id'],
            'receipt_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('payment_receipts', 'receipt_number')->ignore($id, 'receipt_id'),
            ],
            'issued_at' => ['required', 'date'],
            'generated_by' => ['nullable', 'uuid', 'exists:users,id'],
        ];
    }
}

