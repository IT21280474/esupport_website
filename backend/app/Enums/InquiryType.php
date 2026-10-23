<?php

namespace App\Enums;

enum InquiryType: string
{
    use HasOptions;

    case Contact = 'contact';
    case Transport = 'transport';
    case Hotel = 'hotel';
    case PartRequest = 'part_request';

    public function label(): string
    {
        return match ($this) {
            self::Contact => 'Contact message',
            self::Transport => 'Transport request',
            self::Hotel => 'Hotel reservation',
            self::PartRequest => 'Part request',
        };
    }

    /** Forms other than the general contact form always belong to one business area. */
    public function businessArea(): ?BusinessArea
    {
        return match ($this) {
            self::Contact => null,
            self::Transport => BusinessArea::Transportation,
            self::Hotel => BusinessArea::Hotel,
            self::PartRequest => BusinessArea::SpareParts,
        };
    }
}
