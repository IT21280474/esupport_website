<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\ActivityLog;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class LeadController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return LeadResource::collection(Lead::query()->latest('id')->limit(1000)->get());
    }

    /**
     * Mark an enquiry read or unread.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): LeadResource
    {
        $lead->update(['read_at' => $request->boolean('read') ? now() : null]);

        return new LeadResource($lead);
    }

    public function destroy(Request $request, Lead $lead): Response
    {
        $lead->delete();
        ActivityLog::record($request->user(), 'lead.delete', $lead->email);

        return response()->noContent();
    }
}
