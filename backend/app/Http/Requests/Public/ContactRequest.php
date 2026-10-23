<?php

namespace App\Http\Requests\Public;

use App\Enums\BusinessArea;
use App\Enums\InquiryType;
use Illuminate\Validation\Rule;

class ContactRequest extends InquiryRequest
{
    public function type(): InquiryType
    {
        return InquiryType::Contact;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['nullable', 'string', self::PHONE_RULE],
            'business_area' => ['required', Rule::enum(BusinessArea::class)],
            'subject' => ['required', 'string', 'max:190'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    public function inquiryAttributes(): array
    {
        return $this->safe()->only(['name', 'email', 'phone', 'business_area', 'subject', 'message']);
    }
}
