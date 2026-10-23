<?php

namespace App\Http\Controllers\Api\Admin;

use App\Cms\Field;
use App\Cms\Icons;
use App\Enums\ApplicationStatus;
use App\Enums\BusinessArea;
use App\Enums\CareerStatus;
use App\Enums\EmploymentType;
use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/** Option lists for admin dropdowns, sourced from the backend enums. */
class MetaController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'business_areas' => BusinessArea::options(),
            'inquiry_types' => InquiryType::options(),
            'inquiry_statuses' => InquiryStatus::options(),
            'application_statuses' => ApplicationStatus::options(),
            'career_statuses' => CareerStatus::options(),
            'employment_types' => EmploymentType::options(),
            'room_statuses' => RoomStatus::options(),
            'icons' => Icons::ALL,
            'art' => Field::ART,
            'uploads' => config('muthumala.uploads'),
        ]);
    }
}
