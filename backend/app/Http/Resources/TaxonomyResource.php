<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * Lookup records with a name, slug and optional icon/description/image:
 * product categories, vehicle types, brands, CSR categories and gallery albums.
 */
class TaxonomyResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon' => $this->when(isset($this->icon), $this->icon),
            'description' => $this->description,
            'image' => $this->mediaPayload('image'),
            'logo' => $this->mediaPayload('logo'),
            'cover' => $this->mediaPayload('cover'),
            'items_count' => $this->when(isset($this->items_count), $this->items_count),
            $this->adminFields([
                'image_id' => $this->when(array_key_exists('image_id', $this->getAttributes()), $this->image_id),
                'logo_id' => $this->when(array_key_exists('logo_id', $this->getAttributes()), $this->logo_id),
                'cover_id' => $this->when(array_key_exists('cover_id', $this->getAttributes()), $this->cover_id),
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
