<?php

namespace App\Http\Resources;

use App\Models\GalleryImage;
use Illuminate\Http\Request;

/** @mixin GalleryImage */
class GalleryImageResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'album' => $this->whenLoaded('album', fn () => $this->taxonomy($this->album)),
            'image' => $this->mediaPayload('media'),
            'is_featured' => $this->is_featured,
            $this->adminFields([
                'gallery_album_id' => $this->gallery_album_id,
                'media_id' => $this->media_id,
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
