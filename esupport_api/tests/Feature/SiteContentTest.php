<?php

namespace Tests\Feature;

use App\Models\ContentRevision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SiteContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['website.test/*' => Http::response(['revalidated' => true])]);
    }

    public function test_saving_tells_the_website_to_refresh_its_cache(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Fresh']])->assertOk();

        Http::assertSent(fn (Request $request): bool => $request->url() === 'http://website.test/api/revalidate'
            && $request->hasHeader('X-Revalidate-Secret', 'test-secret'));
    }

    public function test_public_content_returns_defaults_for_every_section(): void
    {
        $response = $this->getJson('/api/v1/content')->assertOk();

        $response->assertJsonPath('data.hero.line1', 'Digital')
            ->assertJsonPath('data.general.brandColors.0', '#FF6B35');
        $this->assertCount(69, $response->json('data.portfolio.sites'));
    }

    public function test_admin_can_save_a_section_and_the_site_reflects_it(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Hello', 'word2' => 'World', 'caption' => 'Test']])
            ->assertOk()
            ->assertJsonPath('data.word1', 'Hello')
            ->assertJsonPath('meta.updated_by', $admin->name);

        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'Hello');
        $this->assertDatabaseHas('content_revisions', ['section_key' => 'culture', 'user_id' => $admin->id]);
        $this->assertDatabaseHas('activity_logs', ['action' => 'content.save', 'detail' => 'The Agency']);
    }

    public function test_saving_sanitises_unsafe_links_unknown_keys_and_types(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $footer = $this->getJson('/api/v1/content')->json('data.footer');
        $footer['socials'] = [['name' => 'Evil', 'href' => 'javascript:alert(1)', 'extra' => 'dropped']];
        $footer['unknown'] = 'dropped';

        $saved = $this->putJson('/api/v1/admin/sections/footer', ['data' => $footer])->assertOk()->json('data');

        $this->assertSame([['name' => 'Evil', 'href' => '']], $saved['socials']);
        $this->assertArrayNotHasKey('unknown', $saved);
    }

    public function test_numbers_are_clamped_and_categories_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $stats = $this->putJson('/api/v1/admin/sections/stats', ['data' => [
            'label' => 'L', 'intro' => 'I',
            'items' => [['value' => '42', 'suffix' => '+', 'label' => 'A', 'sub' => 'B', 'fill' => 500]],
        ]])->assertOk()->json('data.items.0');
        $this->assertSame(42, $stats['value']);
        $this->assertSame(100, $stats['fill']);

        $portfolio = $this->getJson('/api/v1/content')->json('data.portfolio');
        $portfolio['sites'] = [['name' => 'X', 'url' => 'https://x.test', 'categories' => ['Tourism', 'Not A Category'], 'image' => '']];
        $site = $this->putJson('/api/v1/admin/sections/portfolio', ['data' => $portfolio])->assertOk()->json('data.sites.0');
        $this->assertSame(['Tourism'], $site['categories']);
    }

    public function test_admin_sees_history_and_can_restore_a_revision(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'First']])->assertOk();
        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Second']])->assertOk();
        $first = ContentRevision::query()->where('section_key', 'culture')->oldest('id')->firstOrFail();

        $this->getJson('/api/v1/admin/sections/culture')
            ->assertOk()
            ->assertJsonPath('data.word1', 'Second')
            ->assertJsonCount(2, 'revisions')
            ->assertJsonPath('definition.title', 'The Agency');

        $this->postJson("/api/v1/admin/sections/culture/revisions/{$first->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.word1', 'First');
        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'First');
    }

    public function test_revision_from_another_section_cannot_be_restored(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $revision = ContentRevision::factory()->create(['section_key' => 'hero']);

        $this->postJson("/api/v1/admin/sections/culture/revisions/{$revision->id}/restore")->assertNotFound();
    }

    public function test_only_admins_can_reset_a_section(): void
    {
        $this->putSection(User::factory()->admin()->create(), 'culture', ['word1' => 'Edited']);

        Sanctum::actingAs(User::factory()->create());
        $this->deleteJson('/api/v1/admin/sections/culture')->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->deleteJson('/api/v1/admin/sections/culture')->assertNoContent();
        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'The');
    }

    public function test_unknown_sections_return_not_found(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/sections/nope')->assertNotFound();
        $this->putJson('/api/v1/admin/sections/nope', ['data' => []])->assertNotFound();
    }

    public function test_admin_endpoints_require_authentication(): void
    {
        $this->getJson('/api/v1/admin/schema')->assertUnauthorized();
        $this->putJson('/api/v1/admin/sections/culture', ['data' => []])->assertUnauthorized();
    }

    public function test_schema_lists_every_section(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/schema')
            ->assertOk()
            ->assertJsonCount(24, 'data.sections')
            ->assertJsonPath('data.sections.0.key', 'general');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function putSection(User $user, string $key, array $data): void
    {
        Sanctum::actingAs($user);
        $this->putJson("/api/v1/admin/sections/{$key}", ['data' => $data])->assertOk();
    }
}
