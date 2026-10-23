<?php

namespace App\Http\Requests\Admin;

class FleetItemRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule('fleet_items'),
            'vehicle_type_id' => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'capacity' => ['nullable', 'string', 'max:190'],
            'details' => ['nullable', 'string', 'max:5000'],
            'image_id' => $this->mediaRule(),
            ...$this->galleryRules(),
            ...$this->flagRules(),
        ];
    }
}
