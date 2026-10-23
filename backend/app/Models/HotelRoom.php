<?php

namespace App\Models;

use App\Enums\RoomStatus;
use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name', 'slug', 'description', 'price', 'price_label', 'capacity', 'bed_type',
    'image_id', 'status', 'is_featured', 'is_active', 'sort_order',
])]
class HotelRoom extends Model
{
    use HasGallery, HasSlug, IsCmsContent, SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'capacity' => 'integer',
            'status' => RoomStatus::class,
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(HotelAmenity::class)->orderBy('sort_order');
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_id');
    }
}
