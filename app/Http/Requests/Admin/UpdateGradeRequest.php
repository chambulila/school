<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('edit-grade') ?? false;
    }

    public function rules(): array
    {
        $gradeParam = $this->route('grade');
        $gradeId = is_object($gradeParam) ? ($gradeParam->getKey() ?? $gradeParam->id ?? null) : $gradeParam;

        return [
            'grade_name' => ['required', 'string', 'max:100', 'unique:grades,grade_name,' . $gradeId . ',id'],
        ];
    }
}

