<?php

namespace App\Http\Requests\Admin;

use App\Enums\RoomStatus;
use Illuminate\Validation\Rule;

class HotelRoomRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule('hotel_rooms'),
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'price_label' => ['nullable', 'string', 'max:60'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'bed_type' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::enum(RoomStatus::class)],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['integer', 'exists:hotel_amenities,id'],
            'image_id' => $this->mediaRule(),
            ...$this->galleryRules(),
            ...$this->flagRules(),
        ];
    }
}
