<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Generates a unique, URL-safe slug from the model's name/title when none is given.
 * Soft-deleted rows are considered so the unique index is never violated.
 */
trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::saving(function ($model) {
            $slug = $model->slug ?: $model->getAttribute($model->slugSource());
            $model->slug = $model->uniqueSlug(Str::slug((string) $slug) ?: Str::lower(Str::random(8)));
        });
    }

    protected function slugSource(): string
    {
        return array_key_exists('title', $this->getAttributes()) ? 'title' : 'name';
    }

    protected function uniqueSlug(string $base): string
    {
        $slug = Str::limit($base, 180, '');
        $suffix = 2;

        while ($this->slugExists($slug)) {
            $slug = Str::limit($base, 180, '').'-'.$suffix++;
        }

        return $slug;
    }

    private function slugExists(string $slug): bool
    {
        $query = static::query()->where('slug', $slug);

        if (in_array(SoftDeletes::class, class_uses_recursive(static::class), true)) {
            $query->withTrashed();
        }

        if ($this->exists) {
            $query->whereKeyNot($this->getKey());
        }

        return $query->exists();
    }
}
