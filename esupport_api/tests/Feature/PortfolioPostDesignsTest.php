<?php

namespace Tests\Feature;

use App\Models\ContentSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortfolioPostDesignsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['website.test/*' => Http::response(['revalidated' => true])]);
    }

    public function test_public_content_lists_post_designs_grouped_by_company(): void
    {
        $portfolio = $this->getJson('/api/v1/content')->assertOk()->json('data.portfolio');

        $this->assertSame('Post Designs', $portfolio['postsEyebrow']);
        $this->assertNotEmpty($portfolio['postClients']);

        $names = array_column($portfolio['postClients'], 'name');
        $this->assertSame($names, array_values(array_unique($names)), 'Each company should appear once.');

        foreach ($portfolio['postClients'] as $company) {
            $this->assertNotEmpty($company['posts'], "{$company['name']} should have posts.");

            foreach ($company['posts'] as $post) {
                $this->assertStringStartsWith('/portfolio/posts/', $post['image']);
            }
        }
    }

    public function test_the_existing_websites_and_social_accounts_are_untouched(): void
    {
        $portfolio = $this->getJson('/api/v1/content')->assertOk()->json('data.portfolio');

        $this->assertCount(69, $portfolio['sites']);
        $this->assertCount(10, $portfolio['socialClients']);
    }

    public function test_portfolio_edited_before_post_designs_existed_still_gets_them(): void
    {
        ContentSection::factory()->create(['key' => 'portfolio', 'data' => [
            'eyebrow' => 'Our work',
            'sites' => [],
        ]]);

        $portfolio = $this->getJson('/api/v1/content')->assertOk()->json('data.portfolio');

        $this->assertSame('Our work', $portfolio['eyebrow']);
        $this->assertNotEmpty($portfolio['postClients']);
        $this->assertSame('Creative', $portfolio['postsTitle1']);
    }

    public function test_portfolio_form_has_a_posts_list_inside_each_company(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $fields = collect($this->getJson('/api/v1/admin/schema')->assertOk()->json('data.sections'))
            ->firstWhere('key', 'portfolio')['fields'];

        $companies = collect($fields)->firstWhere('key', 'postClients');
        $this->assertSame('list', $companies['kind']);

        $posts = collect($companies['fields'])->firstWhere('key', 'posts');
        $this->assertSame('list', $posts['kind']);
        $this->assertSame('image', $posts['fields'][0]['kind']);
    }

    public function test_admin_can_publish_post_designs_and_they_are_cleaned_up(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $saved = $this->putJson('/api/v1/admin/sections/portfolio', ['data' => [
            'postsTitle1' => 'Our',
            'postClients' => [
                ['name' => 'Acme', 'extra' => 'dropped', 'posts' => [
                    ['image' => '/uploads/a.webp', 'caption' => 'dropped'],
                    ['image' => 'javascript:alert(1)'],
                ]],
                ['name' => 'Empty Co', 'posts' => 'not a list'],
                'not an object',
            ],
        ]])->assertOk()->assertJsonPath('published', true)->json('data');

        $this->assertSame('Our', $saved['postsTitle1']);
        $this->assertCount(2, $saved['postClients']);

        $blankProfile = [
            'logo' => '',
            'logoBackground' => 'Light',
            'industry' => '',
            'websiteUrl' => '',
            'summary' => '',
            'services' => [],
            'objectives' => [],
        ];

        $this->assertSame(
            ['name' => 'Acme', ...$blankProfile, 'posts' => [['image' => '/uploads/a.webp'], ['image' => '']]],
            $saved['postClients'][0],
        );
        $this->assertSame(['name' => 'Empty Co', ...$blankProfile, 'posts' => []], $saved['postClients'][1]);
    }

    public function test_every_company_has_a_profile_for_its_own_page(): void
    {
        $portfolio = $this->getJson('/api/v1/content')->assertOk()->json('data.portfolio');

        foreach ($portfolio['postClients'] as $company) {
            $name = $company['name'];

            $this->assertNotSame('', $company['industry'], "{$name} needs an industry.");
            $this->assertNotSame('', $company['summary'], "{$name} needs an intro.");
            $this->assertNotEmpty($company['services'], "{$name} needs services.");
            $this->assertNotEmpty($company['objectives'], "{$name} needs objectives.");
            $this->assertContains($company['logoBackground'], ['Light', 'Dark']);
            $this->assertMatchesRegularExpression('#^(|https?://.+)$#', $company['websiteUrl'], "{$name} website should be empty or a full address.");
        }

        $this->assertNotSame('', $portfolio['companyCtaTitle']);
        $this->assertSame('/#contact', $portfolio['companyCtaHref']);
    }

    public function test_company_profile_fields_are_cleaned_up_on_save(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $saved = $this->putJson('/api/v1/admin/sections/portfolio', ['data' => [
            'companyCtaHref' => 'javascript:alert(1)',
            'postClients' => [[
                'name' => 'Acme',
                'logo' => 'javascript:alert(1)',
                'logoBackground' => 'Neon',
                'industry' => 'Retail',
                'websiteUrl' => 'javascript:alert(1)',
                'summary' => 'Sells things.',
                'services' => ['Post design', '  ', 'Page management'],
                'objectives' => 'not a list',
                'posts' => [],
            ]],
        ]])->assertOk()->json('data');

        $this->assertSame('', $saved['companyCtaHref']);

        $company = $saved['postClients'][0];
        $this->assertSame('', $company['logo']);
        $this->assertSame('Light', $company['logoBackground']);
        $this->assertSame('', $company['websiteUrl']);
        $this->assertSame('Retail', $company['industry']);
        $this->assertSame('Sells things.', $company['summary']);
        $this->assertSame(['Post design', 'Page management'], $company['services']);
        $this->assertSame([], $company['objectives']);
    }

    public function test_company_form_offers_logo_industry_services_and_objectives(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $fields = collect($this->getJson('/api/v1/admin/schema')->assertOk()->json('data.sections'))
            ->firstWhere('key', 'portfolio')['fields'];

        $companyFields = collect(collect($fields)->firstWhere('key', 'postClients')['fields'])->pluck('kind', 'key')->all();

        $this->assertSame('image', $companyFields['logo']);
        $this->assertSame('select', $companyFields['logoBackground']);
        $this->assertSame('text', $companyFields['industry']);
        $this->assertSame('url', $companyFields['websiteUrl']);
        $this->assertSame('textarea', $companyFields['summary']);
        $this->assertSame('stringList', $companyFields['services']);
        $this->assertSame('stringList', $companyFields['objectives']);
    }
}
