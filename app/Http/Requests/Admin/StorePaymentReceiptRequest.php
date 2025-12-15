<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-classes') ?? false;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'string', 'exists:payments,payment_id'],
            'receipt_number' => ['required', 'string', 'max:100', 'unique:payment_receipts,receipt_number'],
            'issued_at' => ['required', 'date'],
            'generated_by' => ['nullable', 'uuid', 'exists:users,id'],
        ];
    }
}

