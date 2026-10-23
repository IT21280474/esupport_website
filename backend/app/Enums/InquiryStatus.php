<?php

namespace App\Enums;

enum InquiryStatus: string
{
    use HasOptions;

    case New = 'new';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::InProgress => 'In progress',
            self::Resolved => 'Resolved',
            self::Archived => 'Archived',
        };
    }
}
