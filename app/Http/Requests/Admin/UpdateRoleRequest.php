<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-roles') ?? false;
    }

    public function rules(): array
    {
        $roleParam = $this->route('role');
        $roleId = is_object($roleParam) ? ($roleParam->getKey() ?? $roleParam->id ?? null) : $roleParam;

        return [
            'role_name' => ['required', 'string', 'max:100', 'unique:roles,role_name,' . $roleId . ',id'],
            'description' => ['nullable', 'string'],
        ];
    }
}
