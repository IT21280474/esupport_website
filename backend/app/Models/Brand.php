<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'logo_id', 'sort_order', 'is_active'])]
class Brand extends Model
{
    use HasSlug, IsCmsContent;

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function logo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
