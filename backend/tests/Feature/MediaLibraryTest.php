<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Media;
use Closure;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\CreatesAdmins;
use Tests\Concerns\MakesUploads;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use CreatesAdmins, MakesUploads, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_uploaded_image_gets_dimensions_and_webp_variants(): void
    {
        $admin = $this->actingAsAdmin();

        $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('Tata Lorry.jpg', 1600, 1000),
            'alt' => 'Tata lorry on a hill-country road',
        ])
            ->assertCreated()
            ->assertJsonPath('type', Media::TYPE_IMAGE)
            ->assertJsonPath('width', 1600)
            ->assertJsonPath('height', 1000)
            ->assertJsonPath('alt', 'Tata lorry on a hill-country road')
            ->assertJsonPath('title', 'Tata Lorry');

        $media = Media::sole();
        $this->assertSame($admin->id, $media->uploaded_by);
        $this->assertSame('jpg', $media->extension);
        $this->assertSame([1600, 1000], [$media->width, $media->height]);
        $this->assertSame(
            ['thumb' => [480, 300], 'medium' => [1200, 750], 'large' => [1600, 1000]],
            array_map(fn (array $variant) => [$variant['width'], $variant['height']], $media->variants),
        );

        $disk = Storage::disk('public');
        $disk->assertExists($media->path());

        foreach ($media->variants as $variant) {
            $disk->assertExists($variant['path']);
            $this->assertStringEndsWith('.webp', $variant['path']);
            $this->assertSame(IMAGETYPE_WEBP, getimagesize($disk->path($variant['path']))[2]);
        }
    }

    public function test_small_images_are_never_upscaled(): void
    {
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('icon.png', 300, 200)])
            ->assertCreated();

        $this->assertSame(['thumb'], array_keys(Media::sole()->variants));
        $this->assertSame(300, Media::sole()->variants['thumb']['width']);
    }

    public function test_pdf_documents_are_accepted_without_variants(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->create('price-list.pdf', 120, 'application/pdf')])
            ->assertCreated()
            ->assertJsonPath('type', Media::TYPE_DOCUMENT);

        $this->assertNull(Media::sole()->variants);
    }

    /** @return array<string, array{Closure(): UploadedFile}> */
    public static function unsafeFiles(): array
    {
        return [
            'svg (can carry script)' => [fn () => UploadedFile::fake()->createWithContent(
                'logo.svg',
                '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
            )],
            'php script' => [fn () => UploadedFile::fake()->createWithContent('shell.php', '<?php echo "pwned";')],
            'php script renamed to .jpg' => [fn () => self::realUpload('photo.jpg', "<?php system(\$_GET['cmd']);\n")],
            'html page' => [fn () => UploadedFile::fake()->createWithContent('page.html', '<script>alert(1)</script>')],
        ];
    }

    /** @param  Closure(): UploadedFile  $makeFile */
    #[DataProvider('unsafeFiles')]
    public function test_unsafe_files_are_rejected(Closure $makeFile): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/media', ['file' => $makeFile()])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['file']);

        $this->assertDatabaseCount('media', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_corrupt_image_is_rejected_without_leaving_files_behind(): void
    {
        $this->actingAsAdmin();
        $corrupt = self::realUpload('broken.jpg', "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00".str_repeat('not really a jpeg ', 50));

        $this->postJson('/api/admin/media', ['file' => $corrupt])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['file']);

        $this->assertDatabaseCount('media', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_deleting_media_removes_the_original_and_its_variants(): void
    {
        $this->actingAsAdmin();
        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('photo.jpg', 1600, 1000)])->assertCreated();

        $media = Media::sole();
        $paths = $media->allPaths();
        $this->assertCount(4, $paths);

        $this->deleteJson("/api/admin/media/{$media->id}")->assertOk();

        $this->assertModelMissing($media);
        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
    }

    public function test_replacing_an_image_keeps_the_id_and_removes_the_old_files(): void
    {
        $this->actingAsAdmin();
        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('old.jpg', 800, 600)])->assertCreated();
        $media = Media::sole();
        $oldPaths = $media->allPaths();

        $this->postJson("/api/admin/media/{$media->id}/replace", ['file' => UploadedFile::fake()->image('new.png', 640, 640)])
            ->assertOk()
            ->assertJsonPath('id', $media->id)
            ->assertJsonPath('width', 640);

        foreach ($oldPaths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
        foreach ($media->fresh()->allPaths() as $path) {
            Storage::disk('public')->assertExists($path);
        }
    }
}
