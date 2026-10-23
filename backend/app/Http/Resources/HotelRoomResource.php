<?php

namespace App\Http\Resources;

use App\Models\HotelRoom;
use Illuminate\Http\Request;

/** @mixin HotelRoom */
class HotelRoomResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'price_label' => $this->price_label,
            'capacity' => $this->capacity,
            'bed_type' => $this->bed_type,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'image' => $this->mediaPayload('image'),
            'gallery' => $this->galleryPayload(),
            'amenities' => $this->whenLoaded('amenities', fn () => $this->amenities
                ->map(fn ($amenity) => ['id' => $amenity->id, 'name' => $amenity->name, 'icon' => $amenity->icon])
                ->all()),
            $this->adminFields([
                'image_id' => $this->image_id,
                'gallery_ids' => $this->galleryIds(),
                'amenity_ids' => $this->whenLoaded('amenities', fn () => $this->amenities->pluck('id')->all()),
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
