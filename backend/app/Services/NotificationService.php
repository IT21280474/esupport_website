<?php

namespace App\Services;

use App\Mail\ApplicationReceived;
use App\Mail\InquiryReceived;
use App\Models\ContactInquiry;
use App\Models\JobApplication;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Optional email alerts for new submissions. Recipients and on/off switches
 * live in Admin → Settings → Notifications; mail is sent after the HTTP
 * response so a slow or failing mail server never blocks the visitor.
 */
class NotificationService
{
    public function __construct(private SettingsService $settings) {}

    public function inquiryReceived(ContactInquiry $inquiry): void
    {
        if ($this->settings->get('notifications.inquiry_emails')) {
            $this->sendLater($this->settings->emailList('notifications.inquiry_recipients'), new InquiryReceived($inquiry));
        }
    }

    public function applicationReceived(JobApplication $application): void
    {
        if ($this->settings->get('notifications.application_emails')) {
            $this->sendLater($this->settings->emailList('notifications.application_recipients'), new ApplicationReceived($application));
        }
    }

    /** @param  array<int, string>  $recipients */
    private function sendLater(array $recipients, Mailable $mail): void
    {
        if ($recipients === []) {
            return;
        }

        dispatch(function () use ($recipients, $mail) {
            try {
                Mail::to($recipients)->send($mail);
            } catch (Throwable $e) {
                report($e);
            }
        })->afterResponse();
    }
}
