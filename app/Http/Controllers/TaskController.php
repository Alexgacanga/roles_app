<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with('user');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $tasks = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        // Check if user is allowed to create (Both Admin and User)
        Gate::authorize('create', Task::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'status' => ['required', 'in:Pending,In Progress,Completed'],
            'priority' => ['required', 'in:Low,Medium,High'],
            'due_date' => ['nullable', 'date'],
        ]);

        Task::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Task $task)
    {
        // Check if user is allowed to edit this specific task (Admin only)
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'status' => ['required', 'in:Pending,In Progress,Completed'],
            'priority' => ['required', 'in:Low,Medium,High'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return redirect()->back();
    }

    public function destroy(Task $task)
    {
        // Check if user is allowed to delete this specific task (Admin only)
        Gate::authorize('delete', $task);

        $task->delete();
        return redirect()->back();
    }
}
