<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_editors_cannot_manage_users(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/users')->assertForbidden();
        $this->postJson('/api/v1/admin/users', [])->assertForbidden();
    }

    public function test_admin_can_create_an_editor(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/v1/admin/users', [
            'name' => 'New Editor',
            'email' => 'New@Example.com',
            'password' => 'Secret123!',
            'role' => 'editor',
        ])->assertCreated()->assertJsonPath('data.email', 'new@example.com');

        $this->postJson('/api/v1/auth/login', ['email' => 'new@example.com', 'password' => 'Secret123!'])->assertOk();
    }

    public function test_duplicate_emails_and_short_passwords_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create(['email' => 'taken@example.com']));

        $this->postJson('/api/v1/admin/users', ['name' => 'X', 'email' => 'taken@example.com', 'password' => 'Secret123!', 'role' => 'editor'])
            ->assertJsonValidationErrors('email');
        $this->postJson('/api/v1/admin/users', ['name' => 'X', 'email' => 'x@example.com', 'password' => 'short', 'role' => 'editor'])
            ->assertJsonValidationErrors('password');
    }

    public function test_the_last_admin_cannot_be_demoted_disabled_or_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/users/{$other->id}", ['role' => 'editor'])->assertOk();
        $this->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => 'editor'])->assertJsonValidationErrors('role');
        $this->patchJson("/api/v1/admin/users/{$admin->id}", ['is_active' => false])->assertJsonValidationErrors('is_active');
        $this->deleteJson("/api/v1/admin/users/{$admin->id}")->assertJsonValidationErrors('user');
    }

    public function test_disabling_or_resetting_a_password_signs_the_user_out(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $editor = User::factory()->create();
        $editor->createToken('device');

        $this->patchJson("/api/v1/admin/users/{$editor->id}", ['password' => 'NewSecret123!'])->assertOk();
        $this->assertSame(0, $editor->tokens()->count());

        $editor->createToken('device');
        $this->patchJson("/api/v1/admin/users/{$editor->id}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->assertSame(0, $editor->tokens()->count());
    }

    public function test_admin_can_delete_another_user(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $editor = User::factory()->create();

        $this->deleteJson("/api/v1/admin/users/{$editor->id}")->assertNoContent();

        $this->assertModelMissing($editor);
    }

    public function test_user_can_change_own_password_with_current_password(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('this-device')->plainTextToken;
        $user->createToken('other-device');

        $this->withToken($token)->patchJson('/api/v1/admin/account', [
            'name' => 'Renamed',
            'current_password' => 'wrong',
            'password' => 'NewSecret123!',
            'password_confirmation' => 'NewSecret123!',
        ])->assertJsonValidationErrors('current_password');

        $this->withToken($token)->patchJson('/api/v1/admin/account', [
            'name' => 'Renamed',
            'current_password' => 'password',
            'password' => 'NewSecret123!',
            'password_confirmation' => 'NewSecret123!',
        ])->assertOk()->assertJsonPath('data.name', 'Renamed');

        $this->assertSame(1, $user->tokens()->count());
    }
}
