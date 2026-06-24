<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory(15)->create();

        $this->call(RolesAndPermissionsSeeder::class);

        $randomRoles = [];
        foreach (range(1, 5) as $index) {
            $name = 'random_role_' . $index;
            $label = 'Random Role ' . $index;

            $role = Role::firstOrCreate(
                ['name' => $name],
                ['label' => $label, 'is_super_admin' => false]
            );

            $permissionIds = Permission::inRandomOrder()
                ->limit(rand(2, 6))
                ->pluck('id')
                ->toArray();

            $role->permissions()->sync($permissionIds);
            $randomRoles[] = $role;
        }

        $availableRoles = Role::where('is_super_admin', false)->get();

        $users->each(function (User $user) use ($availableRoles) {
            $assignedRoles = $availableRoles
                ->shuffle()
                ->take(rand(1, 3))
                ->pluck('id')
                ->toArray();

            $user->roles()->sync($assignedRoles);

            $activeRole = Role::whereIn('id', $assignedRoles)->inRandomOrder()->first();
            if ($activeRole) {
                $user->update(['role' => $activeRole->name]);
            }
        });

        Task::factory()
            ->count(120)
            ->make()
            ->each(function (Task $task) use ($users) {
                $task->user_id = $users->random()->id;
                $task->save();
            });
    }
}
