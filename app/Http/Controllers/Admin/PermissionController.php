<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function index(): Response
    {
        ifCan('manage-permissions');
        $permissions = Permission::query()
            ->orderBy('module')
            ->orderBy('name')
            ->get();

        $modules = [];
        foreach ($permissions->groupBy('module') as $module => $items) {
            $modules[$module] = $items->map(function ($p) {
                return [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'name' => $p->name,
                    'description' => $p->description,
                ];
            })->values();
        }

        return Inertia::render('admin/permissions', [
            'modules' => $modules,
            'roles' => Role::query()->with('permissions')->orderBy('role_name')->get(),
        ]);
    }

    public function update(Request $request, $role_id): RedirectResponse
    {
        ifCan('manage-permissions');

        return DB::transaction(function () use ($request, $role_id) {
            $role = Role::find($role_id);
            if (!$role) {
                return back()->with('error', 'Role not found');
            }

            $permission_ids = $request->input('permission_ids', []);
            $oldPermissions = $role->permissions()->pluck('permissions.id')->toArray();

            try {
                $role->permissions()->sync($permission_ids);

                AuditService::log(
                    actionType: 'UPDATE',
                    entityName: 'Role',
                    entityId: $role->id,
                    oldValue: ['permissions' => $oldPermissions],
                    newValue: ['permissions' => $permission_ids],
                    module: 'User Management',
                    category: 'Permissions',
                    notes: "Updated permissions for role '{$role->role_name}'"
                );

            } catch (Exception $e) {
                return back()->with('error', 'An error occurred while updating permissions to a role '. $role->role_name);
            }

            return back()->with('success', 'Permissions updated');
        });
    }
}
