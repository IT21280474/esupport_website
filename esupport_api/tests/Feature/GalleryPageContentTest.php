<?php

namespace Tests\Feature;

use App\Models\ContentSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GalleryPageContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['website.test/*' => Http::response(['revalidated' => true])]);
    }

    public function test_public_content_includes_starter_gallery_photos_and_the_nav_label(): void
    {
        $this->getJson('/api/v1/content')
            ->assertOk()
            ->assertJsonPath('data.navbar.galleryLabel', 'Gallery')
            ->assertJsonPath('data.galleryPage.titleLine2', 'Gallery')
            ->assertJsonPath('data.galleryPage.categories', ['Projects', 'Team', 'Events', 'Office'])
            ->assertJsonCount(12, 'data.galleryPage.photos');
    }

    public function test_navigation_edited_before_the_gallery_existed_still_gets_the_gallery_label(): void
    {
        ContentSection::factory()->create(['key' => 'navbar', 'data' => [
            'servicesLabel' => 'What we do',
            'portfolioLabel' => 'Work',
            'aboutLabel' => 'Us',
            'contactLabel' => 'Talk',
        ]]);

        $this->getJson('/api/v1/content')
            ->assertJsonPath('data.navbar.servicesLabel', 'What we do')
            ->assertJsonPath('data.navbar.galleryLabel', 'Gallery');
    }

    public function test_gallery_page_is_listed_for_the_admin_forms(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $sections = collect($this->getJson('/api/v1/admin/schema')->assertOk()->json('data.sections'));

        $gallery = $sections->firstWhere('key', 'galleryPage');
        $this->assertSame('Gallery page', $gallery['group']);
        $this->assertSame('photos', collect($gallery['fields'])->firstWhere('kind', 'list')['key']);
    }

    public function test_admin_can_publish_a_gallery_and_it_is_cleaned_up(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $saved = $this->putJson('/api/v1/admin/sections/galleryPage', ['data' => [
            'titleLine1' => 'Team',
            'categories' => ['Events', '  ', 'Office'],
            'photos' => [
                ['image' => '/uploads/a.webp', 'title' => 'Party', 'caption' => 'Fun', 'categories' => ['Events', 'Not Defined'], 'shape' => 'Landscape', 'extra' => 'dropped'],
                ['image' => 'javascript:alert(1)', 'title' => 'Bad', 'categories' => 'nope', 'shape' => 'Panorama'],
            ],
            'ctaHref' => 'javascript:alert(1)',
        ]])->assertOk()->assertJsonPath('published', true)->json('data');

        $this->assertSame(['Events', 'Office'], $saved['categories']);
        $this->assertSame(
            ['image' => '/uploads/a.webp', 'title' => 'Party', 'caption' => 'Fun', 'categories' => ['Events'], 'shape' => 'Landscape'],
            $saved['photos'][0]
        );
        $this->assertSame('', $saved['photos'][1]['image']);
        $this->assertSame([], $saved['photos'][1]['categories']);
        $this->assertSame('Portrait', $saved['photos'][1]['shape']);
        $this->assertSame('', $saved['ctaHref']);

        $this->getJson('/api/v1/content')
            ->assertJsonPath('data.galleryPage.titleLine1', 'Team')
            ->assertJsonCount(2, 'data.galleryPage.photos');
    }

    public function test_an_editors_gallery_changes_wait_for_approval(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->putJson('/api/v1/admin/sections/galleryPage', ['data' => ['titleLine1' => 'Pending', 'photos' => []]])
            ->assertAccepted()
            ->assertJsonPath('published', false);

        $this->getJson('/api/v1/content')
            ->assertJsonPath('data.galleryPage.titleLine1', 'Our')
            ->assertJsonCount(12, 'data.galleryPage.photos');
    }
}
