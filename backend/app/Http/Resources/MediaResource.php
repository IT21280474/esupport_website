<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/** Admin media-library item. @mixin \App\Models\Media */
class MediaResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->toPublicArray(),
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'extension' => $this->extension,
            'size' => $this->size,
            'uploaded_by' => $this->whenLoaded('uploader', fn () => $this->uploader?->name),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
