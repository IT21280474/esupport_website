<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Accepts site-relative paths (/contact, #finder), http(s) URLs, mailto: and tel: links.
 * Rejects javascript:, data: and other schemes that could execute code.
 */
class SafeUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if (! is_string($value) || ! self::isSafe($value)) {
            $fail('The :attribute must be a page path (e.g. /contact), a web address, or a mailto:/tel: link.');
        }
    }

    public static function isSafe(string $value): bool
    {
        $value = trim($value);

        if (str_starts_with($value, '//')) {
            return false;
        }

        if (str_starts_with($value, '/') || str_starts_with($value, '#') || str_starts_with($value, '?')) {
            return true;
        }

        return (bool) preg_match('~^(https?://[^\s<>"]+|mailto:[^\s<>"]+|tel:\+?[0-9 ()\-]+)$~i', $value);
    }
}
