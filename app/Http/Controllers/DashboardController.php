<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $users = User::select('id', 'name', 'email', 'role')
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('dashboard', [
            'users' => $users,
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all()->groupBy('group'),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create_user');

        return Inertia::render('users/Create', [
            'roles' => Role::select('id', 'name', 'label')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create_user');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        $this->syncUserRole($user, $validated['role']);

        return redirect()->route('dashboard');
    }

    public function update(Request $request, User $user)
    {
        Gate::authorize('edit_user');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'exists:roles,name'],
        ]);

        if ($request->user()->id === $user->id && $validated['role'] !== 'admin') {
            return response()->json([
                'errors' => [
                    'role' => ['You cannot change your own role.'],
                ],
            ], 422);
        }

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);
        $this->syncUserRole($user, $validated['role']);

        return redirect()->route('dashboard');
    }

    public function destroy(Request $request, User $user)
    {
        Gate::authorize('delete_user');

        if ($request->user()->id === $user->id) {
            return response()->json([
                'errors' => [
                    'user' => ['You cannot delete your own account while logged in.'],
                ],
            ], 422);
        }

        $user->delete();

        return redirect()->route('dashboard');
    }

    public function edit(User $user)
    {
        Gate::authorize('edit_user');

        return Inertia::render('users/Edit', [
            'user' => $user,
            'roles' => Role::select('id', 'name', 'label')->get(),
        ]);
    }

    private function syncUserRole(User $user, string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();

        if ($role) {
            $user->roles()->sync([$role->id]);
        }
    }
}
