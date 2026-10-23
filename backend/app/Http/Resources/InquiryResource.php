<?php

namespace App\Http\Resources;

use App\Models\ContactInquiry;
use Illuminate\Http\Request;

/** @mixin ContactInquiry */
class InquiryResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'business_area' => $this->business_area->value,
            'business_area_label' => $this->business_area->label(),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'message' => $this->message,
            'meta' => $this->meta ?? (object) [],
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'notes' => $this->notes,
            'handled_by' => $this->whenLoaded('handler', fn () => $this->handler?->name),
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
