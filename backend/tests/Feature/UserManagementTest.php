<?php

namespace Tests\Feature;

use App\Enums\Permission as PermissionEnum;
use App\Enums\Role;
use App\Models\Permission;
use App\Models\Role as RoleModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

/**
 * UserPolicy: nobody can delete or lock themselves out, and the last active
 * Super Admin can never be removed, deactivated or demoted.
 */
class UserManagementTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    private const LAST_SUPER_ADMIN = 'At least one active Super Admin account is required.';

    public function test_super_admin_can_create_an_admin(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/users', [
            'name' => 'Nimal Perera',
            'email' => 'nimal@example.com',
            'password' => 'StrongPass123',
            'password_confirmation' => 'StrongPass123',
            'role_id' => $this->roleId(Role::InquiryManager),
        ])->assertCreated()->assertJsonPath('role.slug', Role::InquiryManager->value);

        $this->assertDatabaseHas('users', ['email' => 'nimal@example.com', 'is_active' => true]);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = $this->actingAsAdmin();
        $this->createAdmin(Role::SuperAdmin); // so "last super admin" is not the reason

        $this->deleteJson("/api/admin/users/{$admin->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot delete your own account.');

        $this->assertNotSoftDeleted($admin);
    }

    public function test_admin_cannot_deactivate_their_own_account(): void
    {
        $admin = $this->actingAsAdmin();
        $this->createAdmin(Role::SuperAdmin);

        $this->putJson("/api/admin/users/{$admin->id}", $this->payload($admin, ['is_active' => false]))
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot deactivate your own account.');

        $this->assertTrue($admin->fresh()->is_active);
    }

    public function test_super_admin_can_delete_another_admin(): void
    {
        $this->actingAsAdmin();
        $editor = $this->createAdmin(Role::ContentManager);

        $this->deleteJson("/api/admin/users/{$editor->id}")->assertOk();

        $this->assertSoftDeleted($editor);
    }

    public function test_the_last_active_super_admin_cannot_demote_or_deactivate_themselves(): void
    {
        $admin = $this->actingAsAdmin();
        $this->createAdmin(Role::SuperAdmin, ['is_active' => false]); // inactive ones do not count

        $this->putJson("/api/admin/users/{$admin->id}", $this->payload($admin, ['role_id' => $this->roleId(Role::ContentManager)]))
            ->assertForbidden()
            ->assertJsonPath('message', self::LAST_SUPER_ADMIN);

        $this->putJson("/api/admin/users/{$admin->id}", $this->payload($admin, ['is_active' => false]))
            ->assertForbidden()
            ->assertJsonPath('message', self::LAST_SUPER_ADMIN);

        $this->assertTrue($admin->fresh()->isSuperAdmin());
        $this->assertTrue($admin->fresh()->is_active);
    }

    public function test_a_super_admin_can_be_demoted_while_another_remains(): void
    {
        $admin = $this->actingAsAdmin();
        $other = $this->createAdmin(Role::SuperAdmin);

        $this->putJson("/api/admin/users/{$other->id}", $this->payload($other, ['role_id' => $this->roleId(Role::ContentManager)]))
            ->assertOk()
            ->assertJsonPath('role.slug', Role::ContentManager->value);

        // Now $admin is the only super admin left.
        $this->putJson("/api/admin/users/{$admin->id}", $this->payload($admin, ['role_id' => $this->roleId(Role::ContentManager)]))
            ->assertForbidden();
    }

    public function test_delegated_user_manager_cannot_remove_the_last_super_admin(): void
    {
        // Permissions of non-super roles live in the database, so manage_users can be delegated.
        $this->seedRoles();
        RoleModel::where('slug', Role::ContentManager->value)->first()
            ->permissions()->attach(Permission::where('slug', PermissionEnum::ManageUsers->value)->value('id'));

        $superAdmin = $this->createAdmin(Role::SuperAdmin);
        $this->actingAsAdmin(Role::ContentManager);

        $this->deleteJson("/api/admin/users/{$superAdmin->id}")
            ->assertForbidden()
            ->assertJsonPath('message', self::LAST_SUPER_ADMIN);

        $this->putJson("/api/admin/users/{$superAdmin->id}", $this->payload($superAdmin, ['is_active' => false]))
            ->assertForbidden()
            ->assertJsonPath('message', self::LAST_SUPER_ADMIN);

        $this->putJson("/api/admin/users/{$superAdmin->id}", $this->payload($superAdmin, ['role_id' => $this->roleId(Role::InquiryManager)]))
            ->assertForbidden()
            ->assertJsonPath('message', self::LAST_SUPER_ADMIN);

        $superAdmin->refresh();
        $this->assertNotSoftDeleted($superAdmin);
        $this->assertTrue($superAdmin->is_active);
        $this->assertTrue($superAdmin->isSuperAdmin());
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(User $user, array $overrides = []): array
    {
        return [
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id,
            ...$overrides,
        ];
    }
}
