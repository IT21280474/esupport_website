<?php

namespace App\Http\Resources;

use App\Models\Media;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;
use Illuminate\Support\Collection;

/**
 * Shared helpers. Resources serve both the public site and the admin panel;
 * admin-only attributes are merged in for /api/admin requests.
 */
abstract class BaseResource extends JsonResource
{
    public static $wrap = null;

    protected function forAdmin(): bool
    {
        return request()->is('api/admin/*');
    }

    /** @return array<string, mixed>|null|MissingValue */
    protected function mediaPayload(string $relation): mixed
    {
        return $this->whenLoaded($relation, fn () => $this->{$relation}?->toPublicArray());
    }

    /** @return array<int, array<string, mixed>>|MissingValue */
    protected function galleryPayload(): mixed
    {
        return $this->whenLoaded('gallery', fn () => $this->gallery
            ->map(fn (Media $media) => $media->toPublicArray())
            ->values()
            ->all());
    }

    /** @return array<string, mixed>|MissingValue */
    protected function adminFields(array $fields): mixed
    {
        return $this->mergeWhen($this->forAdmin(), $fields);
    }

    /** @return array<int, int>|MissingValue */
    protected function galleryIds(): mixed
    {
        return $this->whenLoaded('gallery', fn () => $this->gallery->pluck('id')->all());
    }

    protected function taxonomy(?object $model): ?array
    {
        return $model ? ['id' => $model->id, 'name' => $model->name, 'slug' => $model->slug] : null;
    }

    /** @return array<int, array<string, mixed>> */
    protected function taxonomies(Collection $models): array
    {
        return $models->map(fn ($model) => $this->taxonomy($model))->values()->all();
    }
}
