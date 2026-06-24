<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Define all permissions
        $permissions = [
            // User management
            ['name' => 'create_user', 'label' => 'Create Users',  'group' => 'users'],
            ['name' => 'edit_user',   'label' => 'Edit Users',    'group' => 'users'],
            ['name' => 'delete_user', 'label' => 'Delete Users',  'group' => 'users'],

            // Task management
            ['name' => 'create_task', 'label' => 'Create Tasks',  'group' => 'tasks'],
            ['name' => 'edit_task',   'label' => 'Edit Tasks',    'group' => 'tasks'],
            ['name' => 'delete_task', 'label' => 'Delete Tasks',  'group' => 'tasks'],

            // Role management (super admin only)
            ['name' => 'create_role', 'label' => 'Create Roles',  'group' => 'roles'],
            ['name' => 'edit_role',   'label' => 'Edit Roles',    'group' => 'roles'],
            ['name' => 'delete_role', 'label' => 'Delete Roles',  'group' => 'roles'],
            ['name' => 'assign_role', 'label' => 'Assign Roles',  'group' => 'roles'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }

        // Super Admin role (bypasses all checks)
        $superAdmin = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['label' => 'Super Admin', 'is_super_admin' => true]
        );

        // Manager role
        $manager = Role::firstOrCreate(
            ['name' => 'manager'],
            ['label' => 'Manager', 'is_super_admin' => false]
        );
        $manager->permissions()->sync(
            Permission::whereIn('name', [
                'create_user',
                'edit_user',
                'create_task',
                'edit_task',
                'delete_task',
            ])->pluck('id')
        );

        // Editor role
        $editor = Role::firstOrCreate(
            ['name' => 'editor'],
            ['label' => 'Editor', 'is_super_admin' => false]
        );
        $editor->permissions()->sync(
            Permission::whereIn('name', [
                'create_task',
                'edit_task',
            ])->pluck('id')
        );

        // Viewer role
        $viewer = Role::firstOrCreate(
            ['name' => 'viewer'],
            ['label' => 'Viewer', 'is_super_admin' => false]
        );
        $viewer->permissions()->sync(
            Permission::whereIn('name', [
                'create_task',
                'edit_task',
            ])->pluck('id')
        );

        // Assign super_admin role to the first user (adjust as needed)
        $firstUser = User::first();
        $firstUser?->roles()->syncWithoutDetaching([$superAdmin->id]);
    }
}
