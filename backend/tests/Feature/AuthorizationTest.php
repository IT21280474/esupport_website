<?php

namespace Tests\Feature;

use App\Enums\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    /** Every admin area, keyed by the permission that guards it. */
    private const AREAS = [
        'pages' => '/api/admin/pages',
        'media' => '/api/admin/media',
        'products' => '/api/admin/products',
        'transportation' => '/api/admin/fleet-items',
        'hotel' => '/api/admin/hotel-rooms',
        'gallery' => '/api/admin/gallery-images',
        'csr' => '/api/admin/csr-projects',
        'careers' => '/api/admin/careers',
        'inquiries' => '/api/admin/inquiries',
        'applications' => '/api/admin/applications',
        'settings' => '/api/admin/settings',
        'users' => '/api/admin/users',
        'activity' => '/api/admin/activity',
    ];

    /** @return array<string, array{Role, array<int, string>}> role => areas it may open */
    public static function roleAccess(): array
    {
        return [
            'super admin' => [Role::SuperAdmin, array_keys(self::AREAS)],
            'content manager' => [Role::ContentManager, ['pages', 'media', 'products', 'transportation', 'hotel', 'gallery', 'csr', 'careers']],
            'inquiry manager' => [Role::InquiryManager, ['inquiries', 'applications']],
        ];
    }

    /** @param  array<int, string>  $allowed */
    #[DataProvider('roleAccess')]
    public function test_each_role_can_only_open_its_own_admin_areas(Role $role, array $allowed): void
    {
        $this->actingAsAdmin($role);

        foreach (self::AREAS as $area => $uri) {
            $expected = in_array($area, $allowed, true) ? 200 : 403;

            $this->assertSame(
                $expected,
                $this->getJson($uri)->getStatusCode(),
                "{$role->value} should get {$expected} on {$uri}",
            );
        }
    }

    /** @return array<string, array{Role}> */
    public static function roles(): array
    {
        return [
            'super admin' => [Role::SuperAdmin],
            'content manager' => [Role::ContentManager],
            'inquiry manager' => [Role::InquiryManager],
        ];
    }

    #[DataProvider('roles')]
    public function test_every_role_can_open_the_shared_admin_endpoints(Role $role): void
    {
        $this->actingAsAdmin($role);

        $this->getJson('/api/admin/me')->assertOk();
        $this->getJson('/api/admin/dashboard')->assertOk();
        $this->getJson('/api/admin/meta')->assertOk();
    }

    public function test_content_manager_cannot_write_to_restricted_areas(): void
    {
        $this->actingAsAdmin(Role::ContentManager);

        $this->putJson('/api/admin/settings/contact', ['values' => ['phone_1' => '0110000000', 'email' => 'x@example.com']])
            ->assertForbidden();
        $this->postJson('/api/admin/users', [])->assertForbidden();
    }

    public function test_inquiry_manager_cannot_write_content(): void
    {
        $this->actingAsAdmin(Role::InquiryManager);

        $this->postJson('/api/admin/products', ['name' => 'Brake Drum'])->assertForbidden();
        $this->postJson('/api/admin/media', [])->assertForbidden();
    }

    public function test_guests_are_rejected_from_every_admin_area(): void
    {
        foreach (self::AREAS as $uri) {
            $this->getJson($uri)->assertUnauthorized();
        }
    }

    public function test_admin_deactivated_mid_session_is_signed_out_on_the_next_request(): void
    {
        $editor = $this->actingAsAdmin(Role::ContentManager);
        $this->getJson('/api/admin/products')->assertOk();

        // A super admin disables the account while the editor is still signed in.
        $editor->update(['is_active' => false]);

        $this->getJson('/api/admin/products')
            ->assertForbidden()
            ->assertJsonPath('message', 'Your admin access has been disabled.');
        $this->assertGuest('web');
    }

    public function test_admin_whose_role_was_removed_mid_session_is_signed_out(): void
    {
        $editor = $this->actingAsAdmin(Role::ContentManager);
        $this->getJson('/api/admin/me')->assertOk();

        $editor->update(['role_id' => null]);

        $this->getJson('/api/admin/me')->assertForbidden();
        $this->assertGuest('web');
    }
}
