<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index()
    {
        Gate::authorize('users.view');

        return Inertia::render('Users/Index', [
            'users' => User::latest()->paginate(10),
        ]);
    }

    /**
     * Update the role of a specific user.
     */
    public function updateRole(Request $request, User $user)
    {
        Gate::authorize('assign_role');

        $validated = $request->validate([
            'role' => ['required', 'in:admin,user'],
        ]);

        // Prevent an admin from demoting their own admin status
        if ($request->user()->id === $user->id && $validated['role'] !== 'admin') {
            return back()->withErrors([
                'role' => 'You cannot change this account, you are already logged in!'
            ]);
        }

        $user->update([
            'role' => $validated['role'],
        ]);

        $role = Role::where('name', $validated['role'])->first();

        if ($role) {
            $user->roles()->sync([$role->id]);
        }

        return back()->with('success', 'User role updated successfully.');
    }

    public function show(User $user)
    {
        $user->load(['tasks' => fn($query) => $query->latest()]);

        return Inertia::render('users/Show', [
            'user' => $user,
        ]);
    }
}
