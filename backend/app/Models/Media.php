<?php

namespace App\Models;

use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'disk', 'directory', 'filename', 'original_name', 'mime_type', 'extension', 'size',
    'width', 'height', 'type', 'alt', 'title', 'caption', 'variants', 'uploaded_by',
])]
class Media extends Model
{
    use IsCmsContent;

    public const TYPE_IMAGE = 'image';

    public const TYPE_DOCUMENT = 'document';

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::deleted(fn (Media $media) => $media->deleteFiles());
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function path(): string
    {
        return trim($this->directory.'/'.$this->filename, '/');
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path());
    }

    public function variantUrl(string $size): ?string
    {
        $path = $this->variants[$size]['path'] ?? null;

        return $path ? Storage::disk($this->disk)->url($path) : null;
    }

    public function isImage(): bool
    {
        return $this->type === self::TYPE_IMAGE;
    }

    /** All stored files: original plus generated variants. */
    public function allPaths(): array
    {
        return array_merge([$this->path()], array_column($this->variants ?? [], 'path'));
    }

    public function deleteFiles(): void
    {
        Storage::disk($this->disk)->delete($this->allPaths());
    }

    /**
     * Compact representation used by every public API payload.
     *
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        $srcset = collect($this->variants ?? [])
            ->map(fn ($variant) => Storage::disk($this->disk)->url($variant['path']).' '.$variant['width'].'w')
            ->values()
            ->implode(', ');

        return [
            'id' => $this->id,
            'type' => $this->type,
            'url' => $this->url(),
            'src' => $this->variantUrl('medium') ?? $this->url(),
            'thumb' => $this->variantUrl('thumb') ?? $this->url(),
            'large' => $this->variantUrl('large') ?? $this->url(),
            'srcset' => $srcset ?: null,
            'width' => $this->width,
            'height' => $this->height,
            'alt' => $this->alt ?? '',
            'title' => $this->title,
            'caption' => $this->caption,
        ];
    }

    public function activityLabel(): string
    {
        return "media “{$this->original_name}”";
    }
}
