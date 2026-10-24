<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_log_in_and_receives_a_token(): void
    {
        $user = User::factory()->admin()->create(['email' => 'admin@example.com']);

        $response = $this->postJson('/api/v1/auth/login', ['email' => 'ADMIN@example.com', 'password' => 'password']);

        $response->assertOk()
            ->assertJsonPath('user.email', 'admin@example.com')
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonStructure(['token']);
        $this->assertNotNull($user->fresh()->last_login_at);
        $this->assertDatabaseHas('activity_logs', ['user_id' => $user->id, 'action' => 'auth.login']);
    }

    public function test_wrong_password_is_rejected(): void
    {
        User::factory()->create(['email' => 'editor@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'editor@example.com', 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Incorrect email or password.');
    }

    public function test_disabled_account_cannot_log_in(): void
    {
        User::factory()->inactive()->create(['email' => 'gone@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'gone@example.com', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This account has been disabled. Contact an administrator.');
    }

    public function test_repeated_failures_are_throttled(): void
    {
        User::factory()->create(['email' => 'editor@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/v1/auth/login', ['email' => 'editor@example.com', 'password' => 'nope'])->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', ['email' => 'editor@example.com', 'password' => 'password'])
            ->assertTooManyRequests();
    }

    public function test_me_requires_a_token(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_the_user_and_unread_count(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('unread_leads', 0);
    }

    public function test_disabled_users_existing_tokens_stop_working(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $user->update(['is_active' => false]);

        $this->withToken($token)->getJson('/api/v1/auth/me')->assertForbidden();
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_logout_revokes_the_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->assertSame(0, $user->tokens()->count());
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }
}
