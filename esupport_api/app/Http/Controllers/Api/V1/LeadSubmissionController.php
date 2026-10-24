<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class LeadSubmissionController extends Controller
{
    /**
     * Public: store an enquiry from the website contact form.
     */
    public function __invoke(StoreLeadRequest $request): JsonResponse
    {
        /* Bots fill the hidden honeypot field; pretend success without storing anything. */
        if ($request->filled('company')) {
            return response()->json(['message' => 'Thanks!'], Response::HTTP_CREATED);
        }

        Lead::query()->create([
            'email' => Str::lower($request->string('email')->toString()),
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
            'message' => $request->input('message'),
            'source' => $request->input('source', 'Home — Get Started'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Thanks!'], Response::HTTP_CREATED);
    }
}
