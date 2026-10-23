<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\ContactRequest;
use App\Http\Requests\Public\HotelReservationRequest;
use App\Http\Requests\Public\InquiryRequest;
use App\Http\Requests\Public\JobApplicationRequest;
use App\Http\Requests\Public\PartRequest;
use App\Http\Requests\Public\TransportRequest;
use App\Services\InquiryService;
use Illuminate\Http\JsonResponse;

/**
 * Public form submissions. All routes are rate limited and honeypot-protected.
 */
class InquiryController extends Controller
{
    public function __construct(private InquiryService $inquiries) {}

    public function contact(ContactRequest $request): JsonResponse
    {
        return $this->store($request, 'Thank you — your message has been sent. Our team will get back to you soon.');
    }

    public function transport(TransportRequest $request): JsonResponse
    {
        return $this->store($request, 'Thank you — your transport request has been sent. Our transport desk will contact you.');
    }

    public function hotel(HotelReservationRequest $request): JsonResponse
    {
        return $this->store($request, 'Thank you — your reservation request has been sent. We will confirm availability shortly.');
    }

    public function part(PartRequest $request): JsonResponse
    {
        return $this->store($request, 'Thank you — your part request has been sent to our spare parts desk.');
    }

    public function apply(JobApplicationRequest $request): JsonResponse
    {
        $this->inquiries->submitApplication($request->safe()->except('cv'), $request->file('cv'), $request);

        return response()->json(['message' => 'Thank you — your application has been received.'], 201);
    }

    private function store(InquiryRequest $request, string $message): JsonResponse
    {
        $this->inquiries->submitInquiry($request->type(), $request->inquiryAttributes(), $request);

        return response()->json(['message' => $message], 201);
    }
}
