<?php

namespace App\Models;

use App\Models\Concerns\HasGallery;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'csr_category_id', 'title', 'slug', 'excerpt', 'description', 'project_date', 'date_label',
    'location', 'image_id', 'is_featured', 'is_active', 'sort_order', 'meta_title', 'meta_description',
])]
class CsrProject extends Model
{
    use HasGallery, HasSlug, IsCmsContent, SoftDeletes;

    protected function casts(): array
    {
        return [
            'project_date' => 'date',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CsrCategory::class, 'csr_category_id');
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_id');
    }
}
