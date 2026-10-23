<?php

namespace App\Mail;

use App\Models\ContactInquiry;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class InquiryReceived extends Mailable
{
    public function __construct(public ContactInquiry $inquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New {$this->inquiry->type->label()} — {$this->inquiry->business_area->label()}",
            replyTo: $this->inquiry->email ? [new Address($this->inquiry->email, $this->inquiry->name)] : [],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.inquiry-received', with: [
            'adminUrl' => config('muthumala.frontend_url').'/admin/inquiries/'.$this->inquiry->id,
        ]);
    }
}
