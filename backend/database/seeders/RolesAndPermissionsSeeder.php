<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Enums\Role as RoleEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect(PermissionEnum::cases())->mapWithKeys(fn (PermissionEnum $permission) => [
            $permission->value => Permission::updateOrCreate(
                ['slug' => $permission->value],
                ['name' => $permission->label(), 'group' => $permission->group()],
            )->id,
        ]);

        foreach (RoleEnum::cases() as $roleEnum) {
            $role = Role::updateOrCreate(
                ['slug' => $roleEnum->value],
                ['name' => $roleEnum->label(), 'description' => $roleEnum->description()],
            );

            $role->permissions()->sync(
                collect($roleEnum->permissions())->map(fn (PermissionEnum $p) => $permissions[$p->value])->all()
            );
        }
    }
}
