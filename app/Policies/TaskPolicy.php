<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermission('create_task');
    }

    public function update(User $user, Task $task = null): bool
    {
        return $user->hasPermission('edit_task');
    }

    public function delete(User $user, Task $task = null): bool
    {
        return $user->hasPermission('delete_task');
    }
}
