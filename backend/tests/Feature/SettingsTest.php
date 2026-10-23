<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    public function test_contact_settings_are_validated(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/admin/settings/contact', ['values' => ['phone_1' => '', 'email' => '', 'opening_hours' => str_repeat('x', 256)]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['values.phone_1', 'values.email', 'values.opening_hours']);

        $this->assertDatabaseCount('settings', 0);
    }

    public function test_contact_settings_are_saved_and_published_to_the_site(): void
    {
        $this->actingAsAdmin();
        $values = [
            'phone_1' => '0112384237',
            'phone_2' => '0716884650',
            'email' => 'info@example.lk',
            'address' => 'No 396, George R De Silva Mawatha, Colombo 13',
        ];

        // Warm the public cache first, so the save must invalidate it
        $this->getJson('/api/site')->assertOk()->assertJsonPath('settings.contact.phone_1', null);

        $this->putJson('/api/admin/settings/contact', ['values' => $values])
            ->assertOk()
            ->assertJsonPath('message', 'Settings saved.')
            ->assertJsonPath('values.phone_1', '0112384237')
            ->assertJsonPath('values.phone_3', null);

        $this->assertSame('info@example.lk', Setting::where('key', 'contact.email')->value('value'));
        $this->assertTrue(Setting::where('key', 'contact.email')->value('is_public'));
        $this->assertSame('0716884650', app(SettingsService::class)->get('contact.phone_2'));

        $this->getJson('/api/site')
            ->assertOk()
            ->assertJsonPath('settings.contact.phone_1', '0112384237')
            ->assertJsonPath('settings.contact.email', 'info@example.lk');

        $this->putJson('/api/admin/settings/contact', ['values' => $values])
            ->assertOk()
            ->assertJsonPath('message', 'No changes to save.');
    }

    public function test_navigation_links_must_be_safe(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/admin/settings/navigation', ['values' => [
            'primary' => [['label' => 'Home', 'url' => '/'], ['label' => 'Click me', 'url' => 'javascript:alert(1)']],
        ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['values.primary.1.url'])
            ->assertJsonMissingValidationErrors(['values.primary.0.url']);
    }

    public function test_unknown_settings_group_is_not_found(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/admin/settings/secrets', ['values' => ['x' => 'y']])->assertNotFound();
    }

    public function test_site_payload_exposes_public_groups_but_never_notifications(): void
    {
        $this->actingAsAdmin();
        $this->putJson('/api/admin/settings/notifications', ['values' => [
            'inquiry_emails' => true,
            'inquiry_recipients' => 'private-inbox@example.com',
        ]])->assertOk();

        $this->assertFalse(Setting::where('key', 'notifications.inquiry_recipients')->value('is_public'));

        $this->getJson('/api/site')
            ->assertOk()
            ->assertJsonStructure(['settings' => ['company', 'contact', 'whatsapp', 'seo', 'website', 'navigation'], 'social'])
            ->assertJsonMissingPath('settings.notifications')
            ->assertDontSee('private-inbox@example.com');

        // Admins still see it in the settings screen
        $this->getJson('/api/admin/settings')
            ->assertOk()
            ->assertJsonPath('values.notifications.inquiry_recipients', 'private-inbox@example.com');
    }
}
