<?php

namespace App\Http\Resources;

use App\Models\JobApplication;
use Illuminate\Http\Request;

/** @mixin JobApplication */
class JobApplicationResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'career_id' => $this->career_id,
            'career' => $this->whenLoaded('career', fn () => $this->career ? ['id' => $this->career->id, 'title' => $this->career->title] : null),
            'position' => $this->position,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'cv' => [
                'name' => $this->cv_original_name,
                'mime' => $this->cv_mime,
                'size' => $this->cv_size,
            ],
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
