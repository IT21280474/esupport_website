<?php

namespace App\Http\Resources;

use App\Models\TransportationService;
use Illuminate\Http\Request;

/** @mixin TransportationService */
class TransportationServiceResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'description' => $this->description,
            'image' => $this->mediaPayload('image'),
            'is_featured' => $this->is_featured,
            $this->adminFields([
                'image_id' => $this->image_id,
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
