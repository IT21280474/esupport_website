<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;

/** @mixin Product */
class ProductResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->when($this->forAdmin() || $request->route('slug'), $this->description),
            'category' => $this->whenLoaded('category', fn () => $this->taxonomy($this->category)),
            'brand' => $this->whenLoaded('brand', fn () => $this->taxonomy($this->brand)),
            'vehicle_types' => $this->whenLoaded('vehicleTypes', fn () => $this->taxonomies($this->vehicleTypes)),
            'image' => $this->mediaPayload('image'),
            'gallery' => $this->galleryPayload(),
            'is_featured' => $this->is_featured,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            $this->adminFields([
                'product_category_id' => $this->product_category_id,
                'brand_id' => $this->brand_id,
                'vehicle_type_ids' => $this->whenLoaded('vehicleTypes', fn () => $this->vehicleTypes->pluck('id')->all()),
                'image_id' => $this->image_id,
                'gallery_ids' => $this->galleryIds(),
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
