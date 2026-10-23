<?php

namespace App\Models\Concerns;

use App\Support\ContentCache;
use Illuminate\Database\Eloquent\Builder;

/**
 * Behaviour shared by every model that feeds the public website:
 *  - audit trail (via LogsActivity)
 *  - public API cache invalidation on any change
 *  - common "active" and "ordered" query scopes
 */
trait IsCmsContent
{
    use LogsActivity;

    public static function bootIsCmsContent(): void
    {
        static::saved(fn () => ContentCache::bump());
        static::deleted(fn () => ContentCache::bump());
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where($this->qualifyColumn('is_active'), true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy($this->qualifyColumn('sort_order'))->orderBy($this->qualifyColumn('id'));
    }
}
