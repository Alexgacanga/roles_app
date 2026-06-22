<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    // Both Admins and Users can create tasks
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'user']);
    }

    public function update(User $user, Task $task = null): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Task $task = null): bool
    {
        return $user->role === 'admin';
    }
}