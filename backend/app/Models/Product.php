<?php

namespace App\Models;

use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name', 'slug', 'sku', 'product_category_id', 'brand_id', 'short_description', 'description',
    'image_id', 'is_featured', 'is_active', 'sort_order', 'meta_title', 'meta_description',
])]
class Product extends Model
{
    use HasGallery, HasSlug, IsCmsContent, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // A part number freed by deleting a product can be reused: the deleted
        // (soft-deleted) record holding it is purged so the unique index holds.
        static::saving(function (Product $product) {
            if ($product->sku && $product->isDirty('sku')) {
                static::onlyTrashed()->where('sku', $product->sku)->whereKeyNot($product->getKey() ?? 0)->get()->each->forceDelete();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function vehicleTypes(): BelongsToMany
    {
        return $this->belongsToMany(VehicleType::class);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_id');
    }

    /**
     * Search by name, SKU or short description and filter by category / vehicle / brand slugs.
     *
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $term) {
                $like = '%'.addcslashes($term, '%_\\').'%';
                $q->where(fn (Builder $w) => $w->where('name', 'like', $like)
                    ->orWhere('sku', 'like', $like)
                    ->orWhere('short_description', 'like', $like));
            })
            ->when($filters['category'] ?? null, fn (Builder $q, string $slug) => $q->whereRelation('category', 'slug', $slug))
            ->when($filters['brand'] ?? null, fn (Builder $q, string $slug) => $q->whereRelation('brand', 'slug', $slug))
            ->when($filters['vehicle_type'] ?? null, fn (Builder $q, string $slug) => $q->whereRelation('vehicleTypes', 'slug', $slug));
    }
}
