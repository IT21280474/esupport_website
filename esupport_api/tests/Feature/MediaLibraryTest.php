<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_uploaded_images_are_converted_to_webp(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/admin/media', [
            'files' => [UploadedFile::fake()->image('Team Photo.png', 3000, 1500)],
        ])->assertCreated();

        $item = $response->json('data.0');
        $this->assertMatchesRegularExpression('#^/uploads/[a-z0-9]+-[a-z0-9]{6}-team-photo\.webp$#', $item['url']);
        $this->assertSame('image/webp', $item['mime']);
        $this->assertSame(2400, $item['width']);
        $this->assertSame(1200, $item['height']);
        Storage::disk('public')->assertExists('uploads/'.$item['filename']);
        $this->assertDatabaseHas('media', ['filename' => $item['filename'], 'uploaded_by' => $user->id]);
    }

    public function test_non_images_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/admin/media', [
            'files' => [UploadedFile::fake()->createWithContent('x.svg', '<svg onload="alert(1)"></svg>')],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('media', 0);
    }

    public function test_uploaded_files_are_served_publicly(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $filename = $this->postJson('/api/v1/admin/media', ['files' => [UploadedFile::fake()->image('a.jpg')]])->json('data.0.filename');

        $this->get("/uploads/{$filename}")
            ->assertOk()
            ->assertHeader('Content-Type', 'image/webp');
        $this->get('/uploads/missing.webp')->assertNotFound();
        $this->get('/uploads/..%2F.env')->assertNotFound();
    }

    public function test_media_can_be_listed_and_deleted(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $filename = $this->postJson('/api/v1/admin/media', ['files' => [UploadedFile::fake()->image('a.jpg')]])->json('data.0.filename');
        $media = Media::query()->where('filename', $filename)->firstOrFail();

        $this->getJson('/api/v1/admin/media')->assertOk()->assertJsonCount(1, 'data');
        $this->deleteJson("/api/v1/admin/media/{$media->id}")->assertNoContent();

        Storage::disk('public')->assertMissing('uploads/'.$filename);
        $this->assertDatabaseCount('media', 0);
    }

    public function test_capture_requires_an_http_url(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/admin/media/capture', ['url' => 'file:///etc/passwd'])->assertUnprocessable();
    }
}
