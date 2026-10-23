<?php

namespace App\Http\Requests\Public;

use App\Enums\InquiryType;

class TransportRequest extends InquiryRequest
{
    public function type(): InquiryType
    {
        return InquiryType::Transport;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', self::PHONE_RULE],
            'email' => ['nullable', 'email:rfc', 'max:190'],
            'service' => ['required', 'string', 'max:120'],
            'date' => ['nullable', 'date', 'after_or_equal:today'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    public function inquiryAttributes(): array
    {
        return [
            ...$this->safe()->only(['name', 'phone', 'email', 'message']),
            'subject' => 'Transport request — '.$this->validated('service'),
            'meta' => $this->meta([
                'service' => $this->validated('service'),
                'required_date' => $this->validated('date'),
            ]),
        ];
    }
}
