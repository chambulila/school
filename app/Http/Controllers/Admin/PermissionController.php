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

class PermissionController extends Controller
{
    public function index(): Response
    {
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
        $role = Role::find($role_id);
        if (!$role) {
            return back()->with('error', 'Role not found');
        }

        $permission_ids = $request->input('permission_ids');

        try {
        $role->permissions()->sync($permission_ids);
        } catch (Exception $e) {
            return back()->with('error', 'An error occurred while updating permissions to a role '. $role->name);
        }

        return back()->with('success', 'Permissions updated');
    }
}

