<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        Gate::authorize('manage-users');

        return Inertia::render('dashboard', [
            'users' => User::select('id', 'name', 'email', 'role')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'role' => ['required', 'in:admin,user'],
        ]);

        if ($request->user()->id === $user->id && $validated['role'] !== 'admin') {
            return response()->json([
                'errors' => [
                    'role' => ['You cannot change this account, you are already logged in!'],
                ],
            ], 422);
        }

        $user->update([
            'role' => $validated['role'],
        ]);

        return redirect()->route('dashboard');
    }
}
