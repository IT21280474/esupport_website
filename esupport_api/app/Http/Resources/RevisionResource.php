<?php

namespace App\Http\Resources;

use App\Models\ContentRevision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ContentRevision
 */
class RevisionResource extends JsonResource
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
            'created_at' => $this->created_at?->toIso8601String(),
            'user_name' => $this->user?->name,
        ];
    }
}
