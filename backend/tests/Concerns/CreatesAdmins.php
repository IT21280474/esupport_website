<?php

namespace Tests\Concerns;

use App\Enums\Role as RoleEnum;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

/**
 * Admin users per role, signed in the way the React SPA is: a Sanctum
 * cookie session for requests whose Origin is a stateful (first-party) domain.
 */
trait CreatesAdmins
{
    /** Must match one of the SANCTUM_STATEFUL_DOMAINS set in phpunit.xml. */
    protected const SPA_ORIGIN = 'http://localhost:5173';

    protected function seedRoles(): void
    {
        if (! Role::exists()) {
            $this->seed(RolesAndPermissionsSeeder::class);
        }
    }

    protected function roleId(RoleEnum $role): int
    {
        $this->seedRoles();

        return Role::where('slug', $role->value)->value('id');
    }

    /** @param  array<string, mixed>  $attributes */
    protected function createAdmin(RoleEnum $role = RoleEnum::SuperAdmin, array $attributes = []): User
    {
        $this->seedRoles();

        return User::factory()->role($role)->create($attributes);
    }

    /** @param  array<string, mixed>  $attributes */
    protected function actingAsAdmin(RoleEnum $role = RoleEnum::SuperAdmin, array $attributes = []): User
    {
        $user = $this->createAdmin($role, $attributes);

        $this->fromSpa()->actingAs($user, 'web');

        return $user;
    }

    /** Send requests as the SPA does, so Sanctum starts a session for them. */
    protected function fromSpa(): static
    {
        return $this->withHeaders(['Origin' => self::SPA_ORIGIN, 'Referer' => self::SPA_ORIGIN.'/admin']);
    }
}
