<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {recipient?}', function ($recipient = null) {
    $to = $recipient ?: config('mail.from.address');
    $mailer = config('mail.default');
    $this->info("Sending test email to [{$to}] using mailer [{$mailer}]...");

    try {
        \Illuminate\Support\Facades\Mail::raw("This is a test email from Muthumala Group website to verify SMTP mail delivery.\nSent at: " . now()->toDateTimeString(), function ($msg) use ($to) {
            $msg->to($to)->subject('Muthumala Group - SMTP Mail Test');
        });
        $this->info("✓ Test email sent successfully to [{$to}]!");
    } catch (\Throwable $e) {
        $this->error("✗ Failed to send email: " . $e->getMessage());
    }
})->purpose('Send a test email to verify mail configuration');

