<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'description', 'image_id', 'sort_order', 'is_active'])]
class VehicleType extends Model
{
    use HasSlug, IsCmsContent;

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }
}
