<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-users');
        $users = User::filter($request)
            ->paginate((int) $request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('admin/users', [ // Note: Ensure the view path matches your actual file structure (admin/users vs dashboard/users)
            'users' => $users,
            'roles' => Role::query()->orderBy('role_name')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        ifCan('create-user');

        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['password'] = Hash::make($data['password']);
            $user = User::create($data);

            if (!empty($data['roles'])) {
                $user->roles()->sync($data['roles']);
            }

            AuditService::log(
                actionType: 'CREATE',
                entityName: 'User',
                entityId: $user->id,
                oldValue: null,
                newValue: $user->toArray(),
                module: 'User Management',
                category: 'Users',
                notes: "Created user '{$user->first_name} {$user->last_name}' with roles: " . implode(', ', $data['roles'] ?? [])
            );

            return back()->with('success', 'User created');
        });
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        ifCan('edit-user');

        return DB::transaction(function () use ($request, $user) {
            $oldValues = $user->toArray();
            $data = $request->validated();

            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            $user->update($data);

            if (array_key_exists('roles', $data)) {
                $user->roles()->sync($data['roles'] ?? []);
            }

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'User',
                entityId: $user->id,
                oldValue: $oldValues,
                newValue: $user->refresh()->toArray(),
                module: 'User Management',
                category: 'Users',
                notes: "Updated user '{$user->first_name} {$user->last_name}'"
            );

            return back()->with('success', 'User updated');
        });
    }

    public function assignRoles(Request $request, User $user): RedirectResponse
    {
        ifCan('manage-roles', 'You are not authorized to assign roles.');

        return DB::transaction(function () use ($request, $user) {
            $request->validate([
                'roles' => ['array'],
                'roles.*' => ['uuid', 'exists:roles,id'],
            ]);

            $oldRoles = $user->roles()->pluck('id')->toArray();
            $user->roles()->sync($request->input('roles', []));

            AuditService::log(
                actionType: 'UPDATE',
                entityName: 'User',
                entityId: $user->id,
                oldValue: ['roles' => $oldRoles],
                newValue: ['roles' => $request->input('roles')],
                module: 'User Management',
                category: 'Roles',
                notes: "Updated roles for user '{$user->first_name} {$user->last_name}'"
            );

            return back()->with('success', 'User roles updated');
        });
    }

    public function destroy(User $user): RedirectResponse
    {
        ifCan('delete-user');

        return DB::transaction(function () use ($user) {
            $id = $user->id;
            $oldValues = $user->toArray();

            $user->delete();

            AuditService::log(
                actionType: 'DELETE',
                entityName: 'User',
                entityId: $id,
                oldValue: $oldValues,
                newValue: null,
                module: 'User Management',
                category: 'Users',
                notes: "Deleted user '{$oldValues['first_name']} {$oldValues['last_name']}'"
            );

            return back()->with('success', 'User deleted');
        });
    }
}

