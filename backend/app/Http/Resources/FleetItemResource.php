<?php

namespace App\Http\Resources;

use App\Models\FleetItem;
use Illuminate\Http\Request;

/** @mixin FleetItem */
class FleetItemResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'vehicle_type' => $this->whenLoaded('vehicleType', fn () => $this->taxonomy($this->vehicleType)),
            'description' => $this->description,
            'capacity' => $this->capacity,
            'details' => $this->details,
            'image' => $this->mediaPayload('image'),
            'gallery' => $this->galleryPayload(),
            'is_featured' => $this->is_featured,
            $this->adminFields([
                'vehicle_type_id' => $this->vehicle_type_id,
                'image_id' => $this->image_id,
                'gallery_ids' => $this->galleryIds(),
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
