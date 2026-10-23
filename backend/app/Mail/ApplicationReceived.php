<?php

namespace App\Mail;

use App\Models\JobApplication;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Alert only — the CV itself is never emailed; it stays on the private disk
 * and is downloaded from the admin panel by authorised users.
 */
class ApplicationReceived extends Mailable
{
    public function __construct(public JobApplication $application) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New job application — {$this->application->position}",
            replyTo: [new Address($this->application->email, $this->application->name)],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.application-received', with: [
            'adminUrl' => config('muthumala.frontend_url').'/admin/applications/'.$this->application->id,
        ]);
    }
}
