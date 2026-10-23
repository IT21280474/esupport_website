<?php

namespace App\Http\Resources;

use App\Models\CsrProject;
use Illuminate\Http\Request;

/** @mixin CsrProject */
class CsrProjectResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'description' => $this->when($this->forAdmin() || $request->route('slug'), $this->description),
            'category' => $this->whenLoaded('category', fn () => $this->taxonomy($this->category)),
            'project_date' => $this->project_date?->toDateString(),
            'date_label' => $this->date_label,
            'location' => $this->location,
            'image' => $this->mediaPayload('image'),
            'gallery' => $this->galleryPayload(),
            'is_featured' => $this->is_featured,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            $this->adminFields([
                'csr_category_id' => $this->csr_category_id,
                'image_id' => $this->image_id,
                'gallery_ids' => $this->galleryIds(),
                'is_active' => $this->is_active,
                'sort_order' => $this->sort_order,
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
