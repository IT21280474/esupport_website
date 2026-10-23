<?php

namespace App\Http\Resources;

use App\Models\HotelAmenity;
use Illuminate\Http\Request;

/** @mixin HotelAmenity */
class HotelAmenityResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'icon' => $this->icon,
            'description' => $this->description,
            $this->adminFields([
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
