<?php

namespace App\Services;

use App\Enums\BusinessArea;
use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Models\Career;
use App\Models\ContactInquiry;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class InquiryService
{
    public function __construct(private NotificationService $notifications) {}

    /** @param  array<string, mixed>  $attributes */
    public function submitInquiry(InquiryType $type, array $attributes, Request $request): ContactInquiry
    {
        $inquiry = ContactInquiry::create([
            ...$attributes,
            'type' => $type,
            'business_area' => $type->businessArea() ?? BusinessArea::from($attributes['business_area']),
            'status' => InquiryStatus::New,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 490, ''),
        ]);

        $this->notifications->inquiryReceived($inquiry);

        return $inquiry;
    }

    /** @param  array<string, mixed>  $attributes */
    public function submitApplication(array $attributes, UploadedFile $cv, Request $request): JobApplication
    {
        // Random name on the private disk: the original filename is never used as a path.
        $path = $cv->store('cvs/'.now()->format('Y/m'), JobApplication::CV_DISK);

        $career = isset($attributes['career_id']) ? Career::find($attributes['career_id']) : null;

        $application = JobApplication::create([
            'career_id' => $career?->id,
            'position' => $career?->title ?? $attributes['position'],
            'name' => $attributes['name'],
            'email' => $attributes['email'],
            'phone' => $attributes['phone'],
            'message' => $attributes['message'] ?? null,
            'cv_path' => $path,
            'cv_original_name' => Str::limit($cv->getClientOriginalName(), 250, ''),
            'cv_mime' => (string) $cv->getMimeType(),
            'cv_size' => $cv->getSize(),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 490, ''),
        ]);

        $this->notifications->applicationReceived($application);

        return $application;
    }
}
