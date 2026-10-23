<?php

namespace Tests\Feature;

use App\Enums\CareerStatus;
use App\Enums\Role;
use App\Models\Career;
use App\Models\JobApplication;
use Closure;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\CreatesAdmins;
use Tests\Concerns\MakesUploads;
use Tests\TestCase;

class JobApplicationTest extends TestCase
{
    use CreatesAdmins, MakesUploads, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Storage::fake('local');
        Storage::fake('public');
    }

    public function test_application_cv_is_stored_on_the_private_disk(): void
    {
        $this->postJson('/api/careers/apply', $this->payload())
            ->assertCreated()
            ->assertJsonPath('message', 'Thank you — your application has been received.');

        $application = JobApplication::sole();
        $this->assertSame('Jane Perera', $application->name);
        $this->assertSame('Graphic Designer', $application->position);
        $this->assertSame('cv.pdf', $application->cv_original_name);
        $this->assertSame('application/pdf', $application->cv_mime);
        $this->assertStringStartsWith('cvs/', $application->cv_path);
        $this->assertStringNotContainsString('cv.pdf', $application->cv_path, 'The client filename must not be used as the path.');

        Storage::disk('local')->assertExists($application->cv_path);
        $this->assertSame([], Storage::disk('public')->allFiles(), 'CVs must never reach the public disk.');
    }

    public function test_application_for_a_listed_career_uses_the_career_title(): void
    {
        $career = Career::create(['title' => 'Stores Assistant', 'status' => CareerStatus::Published]);

        $this->postJson('/api/careers/apply', $this->payload(['career_id' => $career->id, 'position' => 'Something else']))
            ->assertCreated();

        $this->assertSame('Stores Assistant', JobApplication::sole()->position);
        $this->assertSame($career->id, JobApplication::sole()->career_id);
    }

    /** @return array<string, array{Closure(): UploadedFile}> */
    public static function rejectedCvs(): array
    {
        return [
            'executable' => [fn () => UploadedFile::fake()->create('cv.exe', 100, 'application/x-msdownload')],
            'image' => [fn () => UploadedFile::fake()->image('cv.png')],
            'over 5 MB' => [fn () => UploadedFile::fake()->create('cv.pdf', 5121, 'application/pdf')],
            'php script renamed to .pdf' => [fn () => self::realUpload('cv.pdf', "<?php system(\$_GET['cmd']);\n")],
        ];
    }

    /** @param  Closure(): UploadedFile  $makeFile */
    #[DataProvider('rejectedCvs')]
    public function test_unsafe_or_oversized_cv_is_rejected(Closure $makeFile): void
    {
        $this->postJson('/api/careers/apply', $this->payload(['cv' => $makeFile()]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cv']);

        $this->assertDatabaseCount('job_applications', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_cv_is_required(): void
    {
        $this->postJson('/api/careers/apply', $this->payload(['cv' => null]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cv' => 'Please attach your CV.']);
    }

    public function test_inquiry_manager_can_download_a_cv(): void
    {
        $application = $this->submitApplication();

        $this->actingAsAdmin(Role::InquiryManager);
        $response = $this->get("/api/admin/applications/{$application->id}/cv");

        $response->assertOk()
            ->assertDownload('jane-perera-graphic-designer-cv.pdf')
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertSame(Storage::disk('local')->get($application->cv_path), $response->streamedContent());
    }

    public function test_content_manager_cannot_download_a_cv(): void
    {
        $application = $this->submitApplication();

        $this->actingAsAdmin(Role::ContentManager);

        $this->getJson("/api/admin/applications/{$application->id}/cv")->assertForbidden();
    }

    public function test_guests_cannot_download_a_cv(): void
    {
        $application = $this->submitApplication();

        $this->getJson("/api/admin/applications/{$application->id}/cv")->assertUnauthorized();
    }

    public function test_application_listing_never_exposes_the_cv_path(): void
    {
        $application = $this->submitApplication();
        $this->actingAsAdmin(Role::InquiryManager);

        $this->getJson('/api/admin/applications')
            ->assertOk()
            ->assertJsonPath('data.0.id', $application->id)
            ->assertJsonMissingPath('data.0.cv_path')
            ->assertDontSee(basename($application->cv_path), escape: false);
    }

    public function test_deleting_an_application_removes_the_cv_file(): void
    {
        $application = $this->submitApplication();
        Storage::disk('local')->assertExists($application->cv_path);

        $this->actingAsAdmin(Role::InquiryManager);
        $this->deleteJson("/api/admin/applications/{$application->id}")->assertOk();

        $this->assertDatabaseMissing('job_applications', ['id' => $application->id]);
        Storage::disk('local')->assertMissing($application->cv_path);
    }

    private function submitApplication(): JobApplication
    {
        $this->postJson('/api/careers/apply', $this->payload())->assertCreated();

        return JobApplication::sole();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'Jane Perera',
            'email' => 'jane@example.com',
            'phone' => '0771234567',
            'position' => 'Graphic Designer',
            'message' => 'I would love to join your marketing team.',
            'cv' => UploadedFile::fake()->create('cv.pdf', 200, 'application/pdf'),
            ...$overrides,
        ];
    }
}
