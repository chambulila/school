<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-roles');
        $roles = Role::filter($request)
            ->paginate((int) $request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('admin/roles', [
            'roles' => $roles,
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            $role = Role::create($request->validated());

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'Role',
                entityId: $role->id,
                oldValue: null,
                newValue: $role->toArray(),
                module: 'User Management',
                category: 'Roles',
                notes: "Created role '{$role->role_name}'"
            );

            return back()->with('success', 'Role created');
        });
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        return DB::transaction(function () use ($request, $role) {
            $oldValues = $role->toArray();
            $role->update($request->validated());

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'Role',
                entityId: $role->id,
                oldValue: $oldValues,
                newValue: $role->refresh()->toArray(),
                module: 'User Management',
                category: 'Roles',
                notes: "Updated role '{$role->role_name}'"
            );

            return back()->with('success', 'Role updated');
        });
    }

    public function destroy(Role $role): RedirectResponse
    {
        ifCan('delete-role');

        return DB::transaction(function () use ($role) {
            $id = $role->id;
            $oldValues = $role->toArray();

            $role->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'Role',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'User Management',
                category: 'Roles',
                notes: "Deleted role '{$oldValues['role_name']}'"
            );

            return back()->with('success', 'Role deleted');
        });
    }
}

