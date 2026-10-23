<?php

namespace App\Models\Concerns;

use App\Models\Media;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Ordered gallery of media items stored in the polymorphic `mediables` table.
 */
trait HasGallery
{
    public function gallery(): MorphToMany
    {
        return $this->morphToMany(Media::class, 'mediable', 'mediables')
            ->wherePivot('collection', 'gallery')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    /**
     * @param  array<int, int>|null  $mediaIds  ordered list; null leaves the gallery untouched
     */
    public function syncGallery(?array $mediaIds): void
    {
        if ($mediaIds === null) {
            return;
        }

        $sync = [];
        foreach (array_values(array_unique($mediaIds)) as $position => $id) {
            $sync[(int) $id] = ['collection' => 'gallery', 'sort_order' => $position];
        }

        $this->gallery()->sync($sync);
    }
}
