<?php

namespace Tests\Feature;

use App\Models\ContentRevision;
use App\Models\User;
use App\RevisionStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContentApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['website.test/*' => Http::response(['revalidated' => true])]);
    }

    public function test_editor_changes_wait_for_approval_and_do_not_reach_the_live_site(): void
    {
        $editor = User::factory()->create();
        Sanctum::actingAs($editor);

        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Pending']])
            ->assertAccepted()
            ->assertJsonPath('published', false)
            ->assertJsonPath('data.word1', 'Pending');

        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'The');
        $this->assertDatabaseHas('content_revisions', ['section_key' => 'culture', 'user_id' => $editor->id, 'status' => 'pending']);
        $this->assertDatabaseHas('activity_logs', ['action' => 'content.submit', 'detail' => 'The Agency']);
        Http::assertNothingSent();
    }

    public function test_editor_keeps_one_pending_version_per_section_and_sees_it_when_editing(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'First']])->assertAccepted();
        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Second']])->assertAccepted();

        $this->assertSame(1, ContentRevision::query()->pending()->count());
        $this->getJson('/api/v1/admin/sections/culture')
            ->assertOk()
            ->assertJsonPath('data.word1', 'The')
            ->assertJsonPath('draft.status', 'pending')
            ->assertJsonPath('draft.data.word1', 'Second')
            ->assertJsonCount(0, 'revisions');
    }

    public function test_admin_approval_publishes_the_change(): void
    {
        $editor = User::factory()->create();
        $this->submitAs($editor, ['word1' => 'Approved']);
        $revision = ContentRevision::query()->pending()->sole();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/v1/admin/approvals')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.user_name', $editor->name);
        $this->getJson("/api/v1/admin/approvals/{$revision->id}")
            ->assertOk()
            ->assertJsonPath('live.word1', 'The')
            ->assertJsonPath('proposed.word1', 'Approved')
            ->assertJsonPath('stale', false);

        $this->postJson("/api/v1/admin/approvals/{$revision->id}/approve")->assertOk()->assertJsonPath('data.word1', 'Approved');

        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'Approved');
        $this->assertSame(RevisionStatus::Approved, $revision->fresh()->status);
        $this->assertDatabaseHas('activity_logs', ['action' => 'content.approve', 'detail' => "The Agency by {$editor->name}"]);
        Http::assertSentCount(1);

        Sanctum::actingAs($editor);
        $this->getJson('/api/v1/admin/sections/culture')
            ->assertJsonPath('draft', null)
            ->assertJsonPath('meta.updated_by', $editor->name);
    }

    public function test_admin_can_reject_with_a_note_the_editor_sees(): void
    {
        $editor = User::factory()->create();
        $this->submitAs($editor, ['word1' => 'Nope']);
        $revision = ContentRevision::query()->pending()->sole();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson("/api/v1/admin/approvals/{$revision->id}/reject", ['note' => 'Please fix the wording.'])->assertNoContent();
        $this->postJson("/api/v1/admin/approvals/{$revision->id}/approve")->assertConflict();

        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'The');

        Sanctum::actingAs($editor);
        $this->getJson('/api/v1/admin/sections/culture')
            ->assertJsonPath('draft.status', 'rejected')
            ->assertJsonPath('draft.review_note', 'Please fix the wording.');

        $this->deleteJson('/api/v1/admin/sections/culture/draft')->assertNoContent();
        $this->getJson('/api/v1/admin/sections/culture')->assertJsonPath('draft', null);
    }

    public function test_editors_cannot_review_changes(): void
    {
        $revision = ContentRevision::factory()->pending()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/approvals')->assertForbidden();
        $this->postJson("/api/v1/admin/approvals/{$revision->id}/approve")->assertForbidden();
        $this->postJson("/api/v1/admin/approvals/{$revision->id}/reject")->assertForbidden();
        $this->assertTrue($revision->fresh()->isPending());
    }

    public function test_approval_is_flagged_stale_when_the_live_section_changed_since_submission(): void
    {
        $this->submitAs(User::factory()->create(), ['word1' => 'Old base']);
        $revision = ContentRevision::query()->pending()->sole();

        $this->travel(1)->minute();
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Admin edit']])->assertOk();

        $this->getJson("/api/v1/admin/approvals/{$revision->id}")->assertJsonPath('stale', true);
    }

    public function test_editor_restoring_a_version_submits_it_for_approval(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'First']])->assertOk();
        $this->putJson('/api/v1/admin/sections/culture', ['data' => ['word1' => 'Second']])->assertOk();
        $first = ContentRevision::query()->oldest('id')->firstOrFail();

        Sanctum::actingAs(User::factory()->create());
        $this->postJson("/api/v1/admin/sections/culture/revisions/{$first->id}/restore")
            ->assertAccepted()
            ->assertJsonPath('published', false);

        $this->getJson('/api/v1/content')->assertJsonPath('data.culture.word1', 'Second');
        $this->assertSame(1, ContentRevision::query()->pending()->count());
    }

    public function test_pending_versions_cannot_be_restored_directly(): void
    {
        $revision = ContentRevision::factory()->pending()->create();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/v1/admin/sections/culture/revisions/{$revision->id}/restore")->assertNotFound();
    }

    public function test_admins_see_the_pending_count_and_editors_do_not(): void
    {
        ContentRevision::factory()->pending()->count(2)->create();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/v1/auth/me')->assertJsonPath('pending_approvals', 2);

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/auth/me')->assertJsonPath('pending_approvals', 0);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function submitAs(User $editor, array $data): void
    {
        Sanctum::actingAs($editor);
        $this->putJson('/api/v1/admin/sections/culture', ['data' => $data])->assertAccepted();
    }
}
