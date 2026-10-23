<?php

namespace App\Enums;

enum RoomStatus: string
{
    use HasOptions;

    case Available = 'available';
    case Unavailable = 'unavailable';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
