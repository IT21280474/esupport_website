<?php

namespace Tests\Feature;

use App\Enums\BusinessArea;
use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Enums\Role;
use App\Models\ContactInquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

class InquiryAdminTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    public function test_inquiries_can_be_filtered_by_business_area(): void
    {
        $this->inquiry(['name' => 'Parts customer', 'business_area' => BusinessArea::SpareParts]);
        $this->inquiry(['name' => 'Hotel guest', 'type' => InquiryType::Hotel, 'business_area' => BusinessArea::Hotel]);
        $this->actingAsAdmin(Role::InquiryManager);

        $this->getJson('/api/admin/inquiries?business_area=hotel')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Hotel guest');

        $this->getJson('/api/admin/inquiries?business_area=casino')->assertUnprocessable();
    }

    public function test_updating_an_inquiry_records_who_handled_it(): void
    {
        $inquiry = $this->inquiry();
        $manager = $this->actingAsAdmin(Role::InquiryManager);

        $this->putJson("/api/admin/inquiries/{$inquiry->id}", ['status' => InquiryStatus::Resolved->value, 'notes' => 'Called back.'])
            ->assertOk();

        $inquiry->refresh();
        $this->assertSame(InquiryStatus::Resolved, $inquiry->status);
        $this->assertSame($manager->id, $inquiry->handled_by);
    }

    public function test_csv_export_neutralises_spreadsheet_formulas(): void
    {
        $this->inquiry(['name' => '=HYPERLINK("https://evil.example","Click")', 'subject' => '+SUM(A1:A9)']);
        $this->actingAsAdmin(Role::InquiryManager);

        $response = $this->get('/api/admin/inquiries/export');

        $response->assertOk()->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $rows = array_map('str_getcsv', array_filter(explode("\n", ltrim($response->streamedContent(), "\xEF\xBB\xBF"))));
        $this->assertSame('Name', $rows[0][4]);
        $this->assertSame('\'=HYPERLINK("https://evil.example","Click")', $rows[1][4]);
        $this->assertSame("'+SUM(A1:A9)", $rows[1][7]);
    }

    /** @param  array<string, mixed>  $attributes */
    private function inquiry(array $attributes = []): ContactInquiry
    {
        return ContactInquiry::create([
            'type' => InquiryType::Contact,
            'business_area' => BusinessArea::General,
            'name' => 'Kamal Silva',
            'email' => 'kamal@example.com',
            'subject' => 'Question',
            'message' => 'Hello there, I have a question.',
            'status' => InquiryStatus::New,
            ...$attributes,
        ]);
    }
}
