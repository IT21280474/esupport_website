<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_can_submit_an_enquiry(): void
    {
        $this->postJson('/api/v1/leads', [
            'email' => 'Visitor@Example.com',
            'name' => 'John Doe',
            'phone' => '+94 77 123 4567',
            'message' => 'Interested in web development.',
        ])->assertCreated();

        $this->assertDatabaseHas('leads', [
            'email' => 'visitor@example.com',
            'name' => 'John Doe',
            'phone' => '+94 77 123 4567',
            'message' => 'Interested in web development.',
            'source' => 'Home — Get Started',
        ]);
    }

    public function test_invalid_email_is_rejected(): void
    {
        $this->postJson('/api/v1/leads', ['email' => 'not-an-email'])->assertUnprocessable();
    }

    public function test_honeypot_submissions_are_silently_dropped(): void
    {
        $this->postJson('/api/v1/leads', ['email' => 'bot@example.com', 'company' => 'Spam Inc'])->assertCreated();

        $this->assertDatabaseCount('leads', 0);
    }

    public function test_submissions_are_rate_limited_per_ip(): void
    {
        foreach (range(1, 5) as $index) {
            $this->postJson('/api/v1/leads', ['email' => "v{$index}@example.com"])->assertCreated();
        }

        $this->postJson('/api/v1/leads', ['email' => 'v6@example.com'])->assertTooManyRequests();
    }

    public function test_staff_can_read_mark_and_delete_enquiries(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $lead = Lead::factory()->create();

        $this->getJson('/api/v1/admin/leads')->assertOk()->assertJsonPath('data.0.is_read', false);
        $this->patchJson("/api/v1/admin/leads/{$lead->id}", ['read' => true])->assertOk()->assertJsonPath('data.is_read', true);
        $this->deleteJson("/api/v1/admin/leads/{$lead->id}")->assertNoContent();

        $this->assertDatabaseCount('leads', 0);
    }

    public function test_export_is_csv_with_formula_escaping(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Lead::factory()->create(['email' => 'a@example.com', 'name' => '=HYPERLINK("x")']);

        $response = $this->get('/api/v1/admin/leads/export')->assertOk();

        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $csv = $response->streamedContent();
        $this->assertStringContainsString('a@example.com', $csv);
        $this->assertStringContainsString("'=HYPERLINK", $csv);
    }
}
