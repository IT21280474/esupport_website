<?php

namespace Tests\Feature;

use App\Enums\BusinessArea;
use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Mail\InquiryReceived;
use App\Models\ContactInquiry;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InquiryFormsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
    }

    public function test_contact_form_requires_its_fields(): void
    {
        $this->postJson('/api/contact', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'business_area', 'subject', 'message']);

        $this->assertDatabaseCount('contact_inquiries', 0);
    }

    public function test_contact_form_rejects_invalid_values(): void
    {
        $this->postJson('/api/contact', [
            ...$this->contactPayload(),
            'email' => 'not-an-email',
            'phone' => 'call me maybe',
            'business_area' => 'casino',
            'message' => 'Too short',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'phone', 'business_area', 'message'])
            ->assertJsonPath('errors.phone.0', 'Please enter a valid phone number.')
            ->assertJsonMissingValidationErrors(['name', 'subject']);

        $this->assertDatabaseCount('contact_inquiries', 0);
    }

    public function test_contact_inquiry_is_stored_with_its_business_area(): void
    {
        $this->postJson('/api/contact', $this->contactPayload())
            ->assertCreated()
            ->assertJsonPath('message', 'Thank you — your message has been sent. Our team will get back to you soon.');

        $inquiry = ContactInquiry::sole();
        $this->assertSame(InquiryType::Contact, $inquiry->type);
        $this->assertSame(BusinessArea::SpareParts, $inquiry->business_area);
        $this->assertSame(InquiryStatus::New, $inquiry->status);
        $this->assertSame('Kamal Silva', $inquiry->name);
        $this->assertSame('Brake drum for Tata LPT 1613', $inquiry->subject);
        $this->assertSame('127.0.0.1', $inquiry->ip_address);
    }

    public function test_honeypot_submissions_look_successful_but_are_discarded(): void
    {
        $this->postJson('/api/contact', [...$this->contactPayload(), 'company_website' => 'https://spam.example'])
            ->assertCreated()
            ->assertJsonPath('message', 'Thank you — your submission has been received.');

        $this->assertDatabaseCount('contact_inquiries', 0);
        Mail::assertNothingOutgoing();
    }

    public function test_transport_request_is_stored_with_its_details(): void
    {
        $date = now()->addWeek()->toDateString();

        $this->postJson('/api/transport-requests', [
            'name' => 'Ruwan Fernando',
            'phone' => '077 123 4567',
            'service' => 'Goods transport',
            'date' => $date,
            'message' => 'Need a lorry to move stock from Colombo to Galle.',
        ])->assertCreated();

        $inquiry = ContactInquiry::sole();
        $this->assertSame(InquiryType::Transport, $inquiry->type);
        $this->assertSame(BusinessArea::Transportation, $inquiry->business_area);
        $this->assertSame('Transport request — Goods transport', $inquiry->subject);
        $this->assertSame(['service' => 'Goods transport', 'required_date' => $date], $inquiry->meta);
    }

    public function test_hotel_reservation_is_stored_with_its_details(): void
    {
        $checkIn = now()->addDays(10)->toDateString();
        $checkOut = now()->addDays(12)->toDateString();

        $this->postJson('/api/hotel-reservations', [
            'name' => 'Anne Smith',
            'email' => 'anne@example.com',
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => '2',
            'room' => 'Deluxe Double',
        ])->assertCreated();

        $inquiry = ContactInquiry::sole();
        $this->assertSame(InquiryType::Hotel, $inquiry->type);
        $this->assertSame(BusinessArea::Hotel, $inquiry->business_area);
        $this->assertSame(
            ['check_in' => $checkIn, 'check_out' => $checkOut, 'guests' => '2', 'room' => 'Deluxe Double'],
            $inquiry->meta,
        );
    }

    public function test_hotel_check_out_must_be_after_check_in(): void
    {
        $this->postJson('/api/hotel-reservations', [
            'name' => 'Anne Smith',
            'email' => 'anne@example.com',
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(5)->toDateString(),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['check_out' => 'Check-out must be after check-in.']);

        $this->postJson('/api/hotel-reservations', [
            'name' => 'Anne Smith',
            'email' => 'anne@example.com',
            'check_in' => now()->subDay()->toDateString(),
            'check_out' => now()->addDay()->toDateString(),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['check_in' => 'Check-in cannot be in the past.']);

        $this->assertDatabaseCount('contact_inquiries', 0);
    }

    public function test_part_request_is_stored_with_its_details(): void
    {
        $this->postJson('/api/part-requests', [
            'name' => 'Sunil Jayasinghe',
            'phone' => '+94 71 688 4650',
            'vehicle_type' => 'Lorry',
            'model' => 'Tata LPT 1613',
            'part_number' => 'BRK-2231',
            'category' => '',
        ])->assertCreated();

        $inquiry = ContactInquiry::sole();
        $this->assertSame(InquiryType::PartRequest, $inquiry->type);
        $this->assertSame(BusinessArea::SpareParts, $inquiry->business_area);
        $this->assertSame('Part request — Lorry · Tata LPT 1613 · BRK-2231', $inquiry->subject);
        $this->assertSame(['vehicle_type' => 'Lorry', 'model' => 'Tata LPT 1613', 'part_number' => 'BRK-2231'], $inquiry->meta);
    }

    public function test_form_submissions_are_rate_limited_per_ip(): void
    {
        foreach (range(1, 10) as $attempt) {
            $this->postJson('/api/contact', $this->contactPayload())->assertCreated();
        }

        $this->postJson('/api/contact', $this->contactPayload())->assertTooManyRequests();

        $this->assertDatabaseCount('contact_inquiries', 10);
    }

    public function test_notification_email_is_sent_when_enabled_in_settings(): void
    {
        app(SettingsService::class)->updateGroup('notifications', [
            'inquiry_emails' => true,
            'inquiry_recipients' => 'desk@example.com, not-an-email',
        ]);

        $this->postJson('/api/contact', $this->contactPayload())->assertCreated();

        Mail::assertSent(InquiryReceived::class, fn (InquiryReceived $mail) => $mail->hasTo('desk@example.com')
            && count($mail->to) === 1);
    }

    /** @return array<string, string> */
    private function contactPayload(): array
    {
        return [
            'name' => 'Kamal Silva',
            'email' => 'kamal@example.com',
            'phone' => '0112384237',
            'business_area' => BusinessArea::SpareParts->value,
            'subject' => 'Brake drum for Tata LPT 1613',
            'message' => 'Do you have a rear brake drum in stock for a 2015 Tata LPT 1613?',
        ];
    }
}
