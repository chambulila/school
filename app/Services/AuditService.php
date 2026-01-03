<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Log an action to the audit trail.
     *
     * @param string $actionType e.g., CREATE, UPDATE, DELETE, LOGIN
     * @param string $entityName e.g., Student, Payment
     * @param string $entityId e.g., P-123
     * @param array|null $oldValue
     * @param array|null $newValue
     * @param string|null $module e.g., Prospecting, Billing
     * @param string|null $category e.g., Engagement History
     * @param string|null $notes
     * @return AuditLog
     */
    public static function log(
        string $actionType,
        string $entityName,
        string $entityId,
        ?array $oldValue = null,
        ?array $newValue = null,
        ?string $module = null,
        ?string $category = null,
        ?string $notes = null
    ): AuditLog {
        $user = Auth::user();

        $roleName = $user ? $user->roles()->pluck('role_name')->implode(', ') : 'System/Guest';

        return AuditLog::create([
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? ($user->name ?? $user->first_name . ' ' . $user->last_name) : 'System',
            'role' => $roleName,
            'action_type' => $actionType,
            'entity_name' => $entityName,
            'entity_id' => $entityId,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'module' => $module,
            'category' => $category,
            'ip_address' => Request::ip(),
            'browser' => Request::header('user-agent'),
            'notes' => $notes,
        ]);
    }
}
