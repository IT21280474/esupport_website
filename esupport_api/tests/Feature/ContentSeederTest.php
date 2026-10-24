<?php

namespace Tests\Feature;

use App\Models\ContentRevision;
use App\Models\ContentSection;
use App\Models\Media;
use App\Models\User;
use App\RevisionStatus;
use App\Support\Content\ContentRepository;
use App\Support\Content\ContentSchema;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ContentSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Http::fake();
    }

    protected function tearDown(): void
    {
        putenv('SEED_OVERWRITE_CONTENT');

        parent::tearDown();
    }

    public function test_it_loads_the_saved_content_and_its_images_into_an_empty_site(): void
    {
        $this->seed(ContentSeeder::class);

        $admin = User::query()->sole();
        $this->assertTrue($admin->isAdmin());

        $content = app(ContentRepository::class);
        $this->assertSame(['hero', 'navbar', 'portfolio'], ContentSection::query()->orderBy('key')->pluck('key')->all());
        $this->assertFalse($content->get('navbar')['showProducts']);
        $this->assertSame(3, ContentRevision::query()->where('status', RevisionStatus::Approved)->where('user_id', $admin->id)->count());

        $this->assertSame(3, Media::query()->count());
        preg_match_all('#/uploads/([\w.-]+\.webp)#', json_encode($content->all(), JSON_UNESCAPED_SLASHES), $used);
        $this->assertNotEmpty($used[1], 'The seeded content should use at least one uploaded image.');
        foreach (array_unique($used[1]) as $filename) {
            Storage::disk('public')->assertExists('uploads/'.$filename);
            $this->assertDatabaseHas('media', ['filename' => $filename]);
        }
    }

    public function test_running_it_again_changes_nothing(): void
    {
        $this->seed(ContentSeeder::class);
        $this->seed(ContentSeeder::class);

        $this->assertSame(3, ContentSection::query()->count());
        $this->assertSame(3, ContentRevision::query()->count());
        $this->assertSame(3, Media::query()->count());
        $this->assertSame(1, User::query()->count());
    }

    public function test_a_section_that_already_has_content_is_left_alone(): void
    {
        User::factory()->admin()->create();
        ContentSection::factory()->create(['key' => 'navbar', 'data' => ['showProducts' => true]]);

        $this->seed(ContentSeeder::class);

        $this->assertSame(['showProducts' => true], ContentSection::query()->where('key', 'navbar')->value('data'));
        $this->assertSame(['hero', 'navbar', 'portfolio'], ContentSection::query()->orderBy('key')->pluck('key')->all());
    }

    public function test_overwrite_replaces_existing_content_and_keeps_the_old_version_in_history(): void
    {
        $admin = User::factory()->admin()->create();
        $content = app(ContentRepository::class);
        $content->save('navbar', app(ContentSchema::class)->allDefaults()['navbar'], $admin);
        $this->assertTrue($content->get('navbar')['showProducts']);

        putenv('SEED_OVERWRITE_CONTENT=true');
        $this->seed(ContentSeeder::class);

        $this->assertFalse($content->get('navbar')['showProducts']);
        $history = ContentRevision::query()->published()->where('section_key', 'navbar')->get();
        $this->assertCount(2, $history);
        $this->assertTrue($history->last()->data['showProducts']);
    }
}
