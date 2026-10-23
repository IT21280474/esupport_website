<?php

namespace App\Models;

use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'icon', 'description', 'is_active', 'sort_order'])]
class HotelAmenity extends Model
{
    use IsCmsContent;

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(HotelRoom::class);
    }
}
