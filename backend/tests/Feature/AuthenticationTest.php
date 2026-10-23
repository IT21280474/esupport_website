<?php

namespace Tests\Feature;

use App\Enums\Role;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    private const SAME_RESET_MESSAGE = 'If an admin account exists for that email, a password reset link has been sent.';

    public function test_admin_can_log_in_and_receives_their_permissions(): void
    {
        $user = $this->createAdmin(Role::ContentManager, ['email' => 'editor@example.com']);

        $response = $this->fromSpa()->postJson('/api/admin/login', [
            'email' => 'editor@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('role.slug', Role::ContentManager->value)
            ->assertJsonPath('is_super_admin', false);

        $this->assertEqualsCanonicalizing(
            array_map(fn ($permission) => $permission->value, Role::ContentManager->permissions()),
            $response->json('permissions'),
        );
        $this->assertAuthenticatedAs($user, 'web');
        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_login_fails_with_a_wrong_password(): void
    {
        $this->createAdmin(attributes: ['email' => 'admin@example.com']);

        $this->fromSpa()->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest('web');
    }

    public function test_inactive_admin_cannot_log_in(): void
    {
        $this->createAdmin(attributes: ['email' => 'former@example.com', 'is_active' => false]);

        $this->fromSpa()->postJson('/api/admin/login', ['email' => 'former@example.com', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest('web');
    }

    public function test_admin_can_log_out(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Signed out.');

        $this->assertGuest('web');
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        $this->createAdmin(attributes: ['email' => 'admin@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->fromSpa()->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'guess-'.$attempt])
                ->assertUnprocessable();
        }

        // Even the right password is refused once the limit is reached
        $this->fromSpa()->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'password'])
            ->assertTooManyRequests();
        $this->assertGuest('web');
    }

    public function test_guests_cannot_fetch_the_current_admin(): void
    {
        $this->fromSpa()->getJson('/api/admin/me')->assertUnauthorized();
        $this->getJson('/api/admin/me')->assertUnauthorized();
    }

    public function test_a_bogus_bearer_token_is_treated_as_a_guest(): void
    {
        $this->getJson('/api/admin/me', ['Authorization' => 'Bearer not-a-real-token'])->assertUnauthorized();
    }

    public function test_signed_in_admin_can_fetch_their_profile(): void
    {
        $user = $this->actingAsAdmin(Role::InquiryManager);

        $response = $this->getJson('/api/admin/me')
            ->assertOk()
            ->assertJsonPath('email', $user->email)
            ->assertJsonPath('role.slug', Role::InquiryManager->value);

        $this->assertEqualsCanonicalizing(['manage_inquiries', 'manage_applications'], $response->json('permissions'));
    }

    public function test_forgot_password_gives_the_same_answer_for_known_and_unknown_emails(): void
    {
        Notification::fake();
        $user = $this->createAdmin(attributes: ['email' => 'admin@example.com']);

        $this->postJson('/api/admin/forgot-password', ['email' => 'admin@example.com'])
            ->assertOk()
            ->assertExactJson(['message' => self::SAME_RESET_MESSAGE]);

        $this->postJson('/api/admin/forgot-password', ['email' => 'nobody@example.com'])
            ->assertOk()
            ->assertExactJson(['message' => self::SAME_RESET_MESSAGE]);

        Notification::assertSentTimes(ResetPassword::class, 1);
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            // The link points at the React admin, not a Laravel view
            return str_starts_with(
                $notification->toMail($user)->actionUrl,
                'http://localhost:5173/admin/reset-password?token='.$notification->token,
            );
        });
    }

    public function test_password_can_be_reset_with_a_valid_token(): void
    {
        $user = $this->createAdmin(attributes: ['email' => 'admin@example.com']);
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/admin/reset-password', [
            'token' => $token,
            'email' => 'admin@example.com',
            'password' => 'BrandNewSecret42',
            'password_confirmation' => 'BrandNewSecret42',
        ])->assertOk();

        $this->assertTrue(Hash::check('BrandNewSecret42', $user->fresh()->password));

        $this->fromSpa()->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'BrandNewSecret42'])
            ->assertOk();
    }

    public function test_password_reset_rejects_an_invalid_token(): void
    {
        $user = $this->createAdmin(attributes: ['email' => 'admin@example.com']);

        $this->postJson('/api/admin/reset-password', [
            'token' => 'not-a-real-token',
            'email' => 'admin@example.com',
            'password' => 'BrandNewSecret42',
            'password_confirmation' => 'BrandNewSecret42',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
}
