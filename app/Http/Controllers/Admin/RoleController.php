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

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
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
        Role::create($request->validated());
        return back()->with('success', 'Role created');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $role->update($request->validated());
        return back()->with('success', 'Role updated');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();
        return back()->with('success', 'Role deleted');
    }
}

