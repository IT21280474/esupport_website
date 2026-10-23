<?php

namespace Tests\Feature;

use App\Cms\SectionRegistry;
use App\Cms\SectionSchema;
use App\Enums\Role;
use App\Models\Page;
use App\Models\PageSection;
use Database\Seeders\MediaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

class CmsPagesTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    /** Valid content for a "cta_band" section. */
    private const CTA = [
        'label' => 'Get in touch',
        'title' => 'Original title',
        'title_muted' => 'forward together.',
        'buttons' => [
            ['label' => 'Contact Us', 'url' => '/contact', 'variant' => 'light', 'whatsapp' => null, 'icon' => 'arrow'],
            ['label' => 'WhatsApp Us', 'url' => null, 'variant' => 'whatsapp', 'whatsapp' => 'spare_parts', 'icon' => 'none'],
        ],
    ];

    public function test_pages_are_not_found_before_the_site_is_seeded(): void
    {
        $this->getJson('/api/pages/home')->assertNotFound();
        $this->getJson('/api/pages')->assertExactJson([]);
    }

    public function test_seeded_pages_serve_enabled_sections_in_order_with_media_and_live_data(): void
    {
        // MediaSeeder imports and resizes the prototype images: keep them off the real
        // disk, and generate one small variant instead of three (27s -> 3s).
        Storage::fake('public');
        config(['muthumala.image_variants' => ['thumb' => 160]]);
        $this->seed();

        $home = $this->getJson('/api/pages/home')
            ->assertOk()
            ->assertJsonPath('slug', 'home')
            ->assertJsonPath('seo.title', 'Muthumala Group of Companies | Tata & Leyland Spare Parts Sri Lanka · Est. 1967');

        // featured_products and gallery_preview are seeded disabled, so they are left out
        $this->assertSame([
            'home_hero', 'heritage', 'business_cards', 'parts_feature', 'vehicle_cards', 'mobility', 'brand_grid',
            'headline_split', 'hotel_feature', 'csr_feature', 'stats', 'cta_band',
        ], $home->json('sections.*.type'));

        // Media ids are replaced with media payloads, including inside repeaters
        $heroImage = $home->json('sections.0.content.image');
        $this->assertSame(MediaSeeder::ASSETS['hero-fleet'][1], $heroImage['alt']);
        $this->assertStringContainsString('/media/', $heroImage['url']);
        $this->assertStringEndsWith('-thumb.webp', $heroImage['thumb']);
        $this->assertStringEndsWith(' 160w', $heroImage['srcset']);
        $this->assertGreaterThan(0, $heroImage['width']);
        $home->assertJsonPath('sections.4.content.cards.0.image.alt', MediaSeeder::ASSETS['lorry'][1]);
        $home->assertJsonPath('sections.0.data', null);

        // Data-driven sections carry their live records in the same response
        $spareParts = collect($this->getJson('/api/pages/spare-parts')->assertOk()->json('sections'))->keyBy('type');

        $this->assertCount(13, $spareParts['product_categories']['data']);
        $this->assertSame('Engine Components', $spareParts['product_categories']['data'][0]['name']);
        $this->assertSame(['lorries', 'buses', 'tippers'], array_column($spareParts['part_finder']['data']['vehicle_types'], 'slug'));
        $this->assertFalse($spareParts['part_finder']['data']['has_products']);
        $logoBrands = ['PIX', 'NICO', 'Super Seal', 'BANCO', 'JEI', 'RMOSS', 'Rane'];
        $this->assertSame([...$logoBrands, 'WABCO', 'Usha', 'Bimetal'], array_column($spareParts['brand_grid']['data'], 'name'));

        // The home page brand strip is set to show only brands that have a logo
        $homeBrands = collect($home->json('sections'))->firstWhere('type', 'brand_grid')['data'];
        $this->assertSame($logoBrands, array_column($homeBrands, 'name'));
        $this->assertStringEndsWith('-thumb.webp', $homeBrands[0]['logo']['thumb']);

        // About tells the group's history: journey chapters, heritage timeline and promise
        $about = $this->getJson('/api/pages/about')->assertOk();
        $this->assertSame([
            'page_hero', 'story_split', 'journey', 'heritage', 'headline_split', 'statements',
            'numbered_cards', 'chairman_message', 'values', 'link_rows', 'cta_band',
        ], $about->json('sections.*.type'));
        $this->assertSame(['1967', '1980s', '2016', 'Today'], $about->json('sections.2.content.items.*.year'));
        $this->assertStringContainsString('<li>Motor Spare Parts</li>', $about->json('sections.2.content.items.3.body'));
        $this->assertSame('The G. Muthumala Legacy', $about->json('sections.3.content.timeline_title'));
        $this->assertSame('The Expansion', $about->json('sections.3.content.timeline.1.title'));

        // Every seeded section is complete enough to be switched on in the admin
        foreach (PageSection::all() as $section) {
            $rules = SectionSchema::rules(SectionRegistry::get($section->type)['fields']);
            $this->assertTrue(Validator::make(['content' => $section->content], $rules)->passes(), "Seeded {$section->type} section is incomplete");
        }
    }

    public function test_disabled_sections_are_not_served(): void
    {
        $page = $this->createAboutPage();
        $cta = $page->sections()->where('type', 'cta_band')->sole();
        $this->actingAsAdmin(Role::ContentManager);

        $this->patchJson("/api/admin/sections/{$cta->id}/toggle")->assertOk()->assertJsonPath('data.is_enabled', false);
        $this->assertSame(['rich_text', 'map'], $this->getJson('/api/pages/about')->json('sections.*.type'));

        $this->patchJson("/api/admin/sections/{$cta->id}/toggle")->assertOk()->assertJsonPath('data.is_enabled', true);
        $this->assertSame(['cta_band', 'rich_text', 'map'], $this->getJson('/api/pages/about')->json('sections.*.type'));
    }

    public function test_public_page_cache_is_invalidated_when_a_section_is_edited(): void
    {
        $page = $this->createAboutPage();
        $cta = $page->sections()->where('type', 'cta_band')->sole();

        $this->getJson('/api/pages/about')->assertJsonPath('sections.0.content.title', 'Original title');

        // A write that bypasses Eloquent is not seen: the payload is served from cache
        DB::table('page_sections')->where('id', $cta->id)
            ->update(['content' => json_encode([...self::CTA, 'title' => 'Direct database edit'])]);
        $this->getJson('/api/pages/about')->assertJsonPath('sections.0.content.title', 'Original title');

        $this->actingAsAdmin(Role::ContentManager);
        $this->putJson("/api/admin/sections/{$cta->id}", ['content' => [...self::CTA, 'title' => 'Let’s move']])
            ->assertOk()
            ->assertJsonPath('data.content.title', 'Let’s move');

        $this->getJson('/api/pages/about')->assertJsonPath('sections.0.content.title', 'Let’s move');
    }

    /** @return array<string, array{string, array<string, mixed>}> */
    public static function invalidCtaContent(): array
    {
        $button = self::CTA['buttons'][0];

        return [
            'javascript: link' => ['content.buttons.0.url', ['buttons' => [[...$button, 'url' => 'javascript:alert(document.cookie)']]]],
            'data: link' => ['content.buttons.0.url', ['buttons' => [[...$button, 'url' => 'data:text/html;base64,PHNjcmlwdD4=']]]],
            'protocol-relative link' => ['content.buttons.0.url', ['buttons' => [[...$button, 'url' => '//evil.example/login']]]],
            'unknown button style' => ['content.buttons.0.variant', ['buttons' => [[...$button, 'variant' => 'neon']]]],
            'unknown WhatsApp desk' => ['content.buttons.0.whatsapp', ['buttons' => [[...$button, 'whatsapp' => 'sales']]]],
            'too many buttons' => ['content.buttons', ['buttons' => [$button, $button, $button, $button]]],
            'missing button label' => ['content.buttons.0.label', ['buttons' => [[...$button, 'label' => null]]]],
            'missing required title' => ['content.title', ['title' => null]],
        ];
    }

    /** @param  array<string, mixed>  $override */
    #[DataProvider('invalidCtaContent')]
    public function test_invalid_section_content_is_rejected(string $errorKey, array $override): void
    {
        $cta = $this->createAboutPage()->sections()->where('type', 'cta_band')->sole();
        $this->actingAsAdmin(Role::ContentManager);

        $this->putJson("/api/admin/sections/{$cta->id}", ['content' => [...self::CTA, ...$override]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$errorKey]);

        $this->assertSame(self::CTA, $cta->fresh()->content);
    }

    public function test_rich_text_is_sanitised_before_it_is_stored(): void
    {
        $section = $this->createAboutPage()->sections()->where('type', 'rich_text')->sole();
        $this->actingAsAdmin(Role::ContentManager);

        $this->putJson("/api/admin/sections/{$section->id}", ['content' => [
            'title' => 'Our story',
            'body' => '<p onclick="steal()">Since <strong>1967</strong>.</p><script>alert(1)</script>'
                .'<a href="javascript:alert(1)">bad link</a><img src="x" onerror="alert(1)">',
        ]])->assertOk();

        $body = $section->fresh()->content['body'];
        $this->assertStringContainsString('<p>Since <strong>1967</strong>.</p>', $body);
        foreach (['<script', 'alert(1)', 'onclick', 'javascript:', '<img', 'onerror'] as $dangerous) {
            $this->assertStringNotContainsString($dangerous, $body);
        }

        $this->assertSame($body, $this->getJson('/api/pages/about')->json('sections.1.content.body'));
    }

    public function test_a_new_section_can_be_saved_as_an_empty_draft(): void
    {
        $page = $this->createAboutPage();
        $this->actingAsAdmin(Role::ContentManager);

        $response = $this->postJson("/api/admin/pages/{$page->id}/sections", ['type' => 'cta_band', 'content' => [], 'is_enabled' => false])
            ->assertCreated()
            ->assertJsonPath('data.type', 'cta_band')
            ->assertJsonPath('data.is_enabled', false)
            ->assertJsonPath('data.content.title', null)
            ->assertJsonPath('data.sort_order', 3);

        // Drafts are hidden from the website...
        $this->assertSame(['cta_band', 'rich_text', 'map'], $this->getJson('/api/pages/about')->json('sections.*.type'));

        // ...and required fields are enforced once the draft is saved
        $this->putJson('/api/admin/sections/'.$response->json('data.id'), ['content' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['content.title']);
    }

    public function test_a_new_section_is_hidden_unless_explicitly_enabled(): void
    {
        $page = $this->createAboutPage();
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson("/api/admin/pages/{$page->id}/sections", ['type' => 'cta_band'])
            ->assertCreated()
            ->assertJsonPath('data.is_enabled', false);

        $this->assertSame(['cta_band', 'rich_text', 'map'], $this->getJson('/api/pages/about')->json('sections.*.type'));
    }

    public function test_an_incomplete_draft_cannot_be_switched_on(): void
    {
        $page = $this->createAboutPage();
        $this->actingAsAdmin(Role::ContentManager);

        $id = $this->postJson("/api/admin/pages/{$page->id}/sections", ['type' => 'cta_band'])->json('data.id');

        // cta_band requires a title
        $this->patchJson("/api/admin/sections/{$id}/toggle")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['is_enabled']);

        $this->putJson("/api/admin/sections/{$id}", ['content' => ['title' => 'Let us talk']])->assertOk();

        $this->patchJson("/api/admin/sections/{$id}/toggle")
            ->assertOk()
            ->assertJsonPath('data.is_enabled', true);
    }

    public function test_unknown_section_types_cannot_be_added(): void
    {
        $page = $this->createAboutPage();
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson("/api/admin/pages/{$page->id}/sections", ['type' => 'iframe_embed'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    public function test_sections_can_be_reordered(): void
    {
        $page = $this->createAboutPage();
        [$cta, $text, $map] = $page->sections()->get()->all();
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson("/api/admin/pages/{$page->id}/sections/reorder", ['ids' => [$map->id, $cta->id, $text->id]])
            ->assertOk();

        $this->assertSame(['map', 'cta_band', 'rich_text'], $this->getJson('/api/pages/about')->json('sections.*.type'));
        $this->assertSame([0, 1, 2], [$map->fresh()->sort_order, $cta->fresh()->sort_order, $text->fresh()->sort_order]);
    }

    public function test_sections_of_another_page_cannot_be_reordered_into_a_page(): void
    {
        $about = $this->createAboutPage();
        $other = Page::create(['slug' => 'contact', 'title' => 'Contact']);
        $foreign = $other->sections()->create(['type' => 'map', 'content' => ['title' => 'Map'], 'sort_order' => 0]);
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson("/api/admin/pages/{$about->id}/sections/reorder", ['ids' => [$foreign->id]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['ids.0']);

        $this->assertSame($other->id, $foreign->fresh()->page_id);
    }

    private function createAboutPage(): Page
    {
        $page = Page::create(['slug' => 'about', 'title' => 'About', 'is_published' => true]);

        $page->sections()->createMany([
            ['type' => 'cta_band', 'content' => self::CTA, 'sort_order' => 0],
            ['type' => 'rich_text', 'content' => ['title' => 'Our story', 'body' => '<p>Since 1967.</p>'], 'sort_order' => 1],
            ['type' => 'map', 'content' => ['title' => 'Head office'], 'sort_order' => 2],
        ]);

        return $page;
    }
}
