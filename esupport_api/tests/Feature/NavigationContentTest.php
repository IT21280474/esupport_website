<?php

namespace Tests\Feature;

use App\Models\ContentSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NavigationContentTest extends TestCase
{
    use RefreshDatabase;

    private const SWITCHES = ['showServices', 'showProducts', 'showPortfolio', 'showGallery', 'showAbout', 'showContact'];

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['website.test/*' => Http::response(['revalidated' => true])]);
    }

    public function test_public_content_has_a_products_link_and_shows_every_link_by_default(): void
    {
        $navbar = $this->getJson('/api/v1/content')->assertOk()->json('data.navbar');

        $this->assertSame('Products', $navbar['productsLabel']);
        $this->assertSame('/products', $navbar['productsHref']);

        foreach (self::SWITCHES as $switch) {
            $this->assertTrue($navbar[$switch], "{$switch} should default to on.");
        }
    }

    public function test_navigation_edited_before_the_switches_existed_still_shows_every_link(): void
    {
        ContentSection::factory()->create(['key' => 'navbar', 'data' => [
            'servicesLabel' => 'What we do',
            'portfolioLabel' => 'Work',
            'aboutLabel' => 'Us',
            'contactLabel' => 'Talk',
        ]]);

        $navbar = $this->getJson('/api/v1/content')->assertOk()->json('data.navbar');

        $this->assertSame('What we do', $navbar['servicesLabel']);
        $this->assertSame('Products', $navbar['productsLabel']);

        foreach (self::SWITCHES as $switch) {
            $this->assertTrue($navbar[$switch], "{$switch} should default to on.");
        }
    }

    public function test_navigation_form_offers_a_switch_for_every_link(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $fields = collect($this->getJson('/api/v1/admin/schema')->assertOk()->json('data.sections'))
            ->firstWhere('key', 'navbar')['fields'];

        $switches = collect($fields)->where('kind', 'boolean')->pluck('key')->all();

        $this->assertEqualsCanonicalizing(self::SWITCHES, $switches);
        $this->assertContains('productsLabel', collect($fields)->pluck('key')->all());
    }

    public function test_admin_can_turn_links_off_and_repoint_products(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/api/v1/admin/sections/navbar', ['data' => [
            'productsLabel' => 'Solutions',
            'productsHref' => 'https://shop.example.com/',
            'showGallery' => false,
            'showAbout' => false,
        ]])->assertOk()->assertJsonPath('published', true);

        $this->getJson('/api/v1/content')
            ->assertJsonPath('data.navbar.productsLabel', 'Solutions')
            ->assertJsonPath('data.navbar.productsHref', 'https://shop.example.com/')
            ->assertJsonPath('data.navbar.showGallery', false)
            ->assertJsonPath('data.navbar.showAbout', false)
            ->assertJsonPath('data.navbar.showServices', true)
            ->assertJsonPath('data.navbar.showProducts', true)
            ->assertJsonPath('data.navbar.showContact', true);
    }

    public function test_unsafe_products_addresses_are_dropped_and_non_boolean_switches_keep_their_default(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $saved = $this->putJson('/api/v1/admin/sections/navbar', ['data' => [
            'productsHref' => 'javascript:alert(1)',
            'showAbout' => 'no',
            'showContact' => 0,
        ]])->assertOk()->json('data');

        $this->assertSame('', $saved['productsHref']);
        $this->assertTrue($saved['showAbout']);
        $this->assertTrue($saved['showContact']);
    }
}
