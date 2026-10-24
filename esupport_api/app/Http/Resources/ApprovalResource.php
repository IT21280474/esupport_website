<?php

namespace App\Http\Resources;

use App\Models\ContentRevision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An editor's unpublished version of a section, as shown to the editor and on the approvals page.
 *
 * @mixin ContentRevision
 */
class ApprovalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'section_key' => $this->section_key,
            'status' => $this->status->value,
            'submitted_at' => $this->updated_at?->toIso8601String(),
            'user_name' => $this->user?->name,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'reviewer_name' => $this->reviewer?->name,
            'review_note' => $this->review_note,
        ];
    }
}
