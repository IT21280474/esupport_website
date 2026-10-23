<?php

namespace App\Enums;

enum BusinessArea: string
{
    use HasOptions;

    case General = 'general';
    case SpareParts = 'spare_parts';
    case Transportation = 'transportation';
    case Hotel = 'hotel';
    case Csr = 'csr';
    case Careers = 'careers';

    public function label(): string
    {
        return match ($this) {
            self::General => 'General Inquiry',
            self::SpareParts => 'Spare Parts',
            self::Transportation => 'Transportation',
            self::Hotel => 'Hotel',
            self::Csr => 'CSR',
            self::Careers => 'Careers',
        };
    }
}
