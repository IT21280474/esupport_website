<?php

namespace App\Enums;

enum CareerStatus: string
{
    use HasOptions;

    case Draft = 'draft';
    case Published = 'published';
    case Closed = 'closed';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
