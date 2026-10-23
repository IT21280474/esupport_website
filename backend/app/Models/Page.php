<?php

namespace App\Models;

use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'title', 'meta_title', 'meta_description', 'og_image_id', 'theme', 'floating_whatsapp', 'is_published'])]
class Page extends Model
{
    use IsCmsContent;

    public const THEMES = ['default', 'hotel'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)->orderBy('sort_order')->orderBy('id');
    }

    public function ogImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'og_image_id');
    }
}
