<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create-teachers-attendance') ?? false;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.teacher_id' => ['required', 'uuid', 'exists:teachers,id'],
            'records.*.status' => ['required', 'in:Present,Absent,Late,Excused'],
            'records.*.remarks' => ['nullable', 'string'],
        ];
    }
}

