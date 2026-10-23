<?php

namespace App\Http\Requests\Public;

use App\Enums\InquiryType;

class HotelReservationRequest extends InquiryRequest
{
    public function type(): InquiryType
    {
        return InquiryType::Hotel;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['nullable', 'string', self::PHONE_RULE],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['nullable', 'string', 'in:1,2,3,4,5+'],
            'room' => ['nullable', 'string', 'max:120'],
            'message' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return parent::messages() + [
            'check_out.after' => 'Check-out must be after check-in.',
            'check_in.after_or_equal' => 'Check-in cannot be in the past.',
        ];
    }

    public function inquiryAttributes(): array
    {
        return [
            ...$this->safe()->only(['name', 'email', 'phone', 'message']),
            'subject' => 'Reservation request '.$this->validated('check_in').' → '.$this->validated('check_out'),
            'meta' => $this->meta([
                'check_in' => $this->validated('check_in'),
                'check_out' => $this->validated('check_out'),
                'guests' => $this->validated('guests'),
                'room' => $this->validated('room'),
            ]),
        ];
    }
}
