<?php

namespace App\Http\Controllers;

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
        // Ensure only Admins can access user management
        Gate::authorize('manage-users');

        return Inertia::render('Users/Index', [
            'users' => User::latest()->paginate(10),
        ]);
    }

    /**
     * Update the role of a specific user.
     */
    public function updateRole(Request $request, User $user)
    {
        // Ensure only Admins can modify roles
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'role' => ['required', 'in:admin,user,manager,editor,viewer'],
        ]);

        // Prevent an admin from demoting their own admin status
        if ($request->user()->id === $user->id && $validated['role'] !== 'admin') {
            return back()->withErrors([
                'role' => 'You cannot change this account, you are already logged in!'
            ]);
        }

        $user->update([
            'role' => $validated['role']
        ]);

        return back()->with('success', 'User role updated successfully.');
    }
}
