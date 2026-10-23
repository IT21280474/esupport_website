<?php

namespace App\Http\Requests\Public;

use App\Enums\InquiryType;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Base for every public inquiry form. Subclasses declare their rules and map
 * validated input onto the contact_inquiries columns (+ form-specific meta).
 */
abstract class InquiryRequest extends FormRequest
{
    public const PHONE_RULE = 'regex:/^[0-9+\s\-()]{9,20}$/';

    abstract public function type(): InquiryType;

    /** @return array<string, mixed> */
    abstract public function inquiryAttributes(): array;

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid phone number.',
            'message.min' => 'Please add a little more detail.',
        ];
    }

    /** Remove empty meta values so admin views stay tidy. */
    protected function meta(array $values): array
    {
        return array_filter($values, fn ($value) => $value !== null && $value !== '');
    }
}
