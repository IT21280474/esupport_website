<?php

namespace App\Http\Resources;

use App\Models\Career;
use Illuminate\Http\Request;

/** @mixin Career */
class CareerResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        $detail = $this->forAdmin() || $request->route('slug');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'department' => $this->department,
            'location' => $this->location,
            'employment_type' => $this->employment_type?->value,
            'employment_type_label' => $this->employment_type?->label(),
            'summary' => $this->summary,
            'description' => $this->when($detail, $this->description),
            'responsibilities' => $this->when($detail, $this->responsibilities),
            'requirements' => $this->when($detail, $this->requirements),
            'closing_date' => $this->closing_date?->toDateString(),
            'is_open' => $this->isOpen(),
            $this->adminFields([
                'status' => $this->status?->value,
                'sort_order' => $this->sort_order,
                'applications_count' => $this->whenCounted('applications'),
                'updated_at' => $this->updated_at,
            ]),
        ];
    }
}
