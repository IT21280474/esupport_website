<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    use HasOptions;

    case New = 'new';
    case Reviewing = 'reviewing';
    case Shortlisted = 'shortlisted';
    case Rejected = 'rejected';
    case Hired = 'hired';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
