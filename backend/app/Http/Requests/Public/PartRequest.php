<?php

namespace App\Http\Requests\Public;

use App\Enums\InquiryType;

class PartRequest extends InquiryRequest
{
    public function type(): InquiryType
    {
        return InquiryType::PartRequest;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', self::PHONE_RULE],
            'email' => ['nullable', 'email:rfc', 'max:190'],
            'vehicle_type' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:120'],
            'part_number' => ['nullable', 'string', 'max:120'],
            'product' => ['nullable', 'string', 'max:190'],
            'message' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function inquiryAttributes(): array
    {
        $details = $this->meta($this->safe()->only(['vehicle_type', 'model', 'category', 'part_number', 'product']));

        return [
            ...$this->safe()->only(['name', 'phone', 'email', 'message']),
            'subject' => 'Part request'.($details ? ' — '.implode(' · ', $details) : ''),
            'meta' => $details,
        ];
    }
}
