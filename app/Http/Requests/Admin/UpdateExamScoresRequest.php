<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamScoresRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'results' => ['required', 'array'],
            'results.*.id' => ['required', 'uuid', 'exists:exam_results,id'],
            'results.*.score' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
