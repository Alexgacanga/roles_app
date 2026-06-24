<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->filled('search'), fn($query) => $query->where('name', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('roles/index', [
            'roles'       => Role::with('permissions')->get(),
            'permissions' => Permission::all()->groupBy('group'),
            'users'       => $users,
            'filters'     => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create_role');

        $data = $request->validate([
            'name'           => 'required|string|unique:roles,name',
            'label'          => 'required|string',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name'  => $data['name'],
            'label' => $data['label'],
        ]);

        $role->permissions()->sync($data['permission_ids'] ?? []);

        return back()->with('success', 'Role created.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        Gate::authorize('edit_role');

        $data = $request->validate([
            'name'           => ['required', 'string', 'unique:roles,name,' . $role->id],
            'label'          => 'required|string',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name'  => $data['name'],
            'label' => $data['label'],
        ]);
        $role->permissions()->sync($data['permission_ids'] ?? []);

        return back()->with('success', 'Role updated.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('delete_role');
        abort_if($role->is_super_admin, 403, 'Cannot delete the super admin role.');

        $role->delete();

        return back()->with('success', 'Role deleted.');
    }

    // Assign roles to a user
    public function assignToUser(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('assign_role');

        $data = $request->validate([
            'role_ids'   => ['required', 'array', 'min:1'],
            'role_ids.*' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $user->roles()->sync($data['role_ids']);

        $roleName = Role::whereIn('id', $data['role_ids'])->pluck('name')->first();
        if ($roleName) {
            $user->update(['role' => $roleName]);
        }

        return back()->with('success', 'Roles assigned.');
    }
}
