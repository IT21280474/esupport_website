<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * Stores uploaded files on the public disk and records them in the media library.
 * Image binaries never go into MySQL — only path and metadata.
 */
class MediaService
{
    private const DISK = 'public';

    private const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    public function __construct(private ImageProcessor $images) {}

    /** @param  array<string, mixed>  $attributes  alt / title / caption */
    public function store(UploadedFile $file, array $attributes = []): Media
    {
        $stored = $this->putFile($file);

        return DB::transaction(fn () => Media::create($stored + [
            'alt' => $attributes['alt'] ?? null,
            'title' => $attributes['title'] ?? $this->titleFrom($file->getClientOriginalName()),
            'caption' => $attributes['caption'] ?? null,
            'uploaded_by' => Auth::id(),
        ]));
    }

    /** Swap the file behind an existing media item; every reference keeps working. */
    public function replace(Media $media, UploadedFile $file): Media
    {
        $oldPaths = $media->allPaths();
        $media->update($this->putFile($file));
        Storage::disk($media->disk)->delete($oldPaths);

        return $media->refresh();
    }

    /** @return array<string, mixed> */
    private function putFile(UploadedFile $file): array
    {
        $mime = (string) $file->getMimeType();
        $extension = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension());
        $directory = 'media/'.now()->format('Y/m');
        $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'file';
        $filename = Str::limit($name, 80, '').'-'.Str::lower(Str::random(6)).'.'.$extension;

        Storage::disk(self::DISK)->putFileAs($directory, $file, $filename);

        $attributes = [
            'disk' => self::DISK,
            'directory' => $directory,
            'filename' => $filename,
            'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
            'mime_type' => $mime,
            'extension' => $extension,
            'size' => $file->getSize(),
            'type' => in_array($mime, self::IMAGE_MIMES, true) ? Media::TYPE_IMAGE : Media::TYPE_DOCUMENT,
            'width' => null,
            'height' => null,
            'variants' => null,
        ];

        if ($attributes['type'] === Media::TYPE_IMAGE) {
            try {
                $processed = $this->images->process(self::DISK, "{$directory}/{$filename}");
            } catch (RuntimeException) {
                // Looks like an image but can't be decoded: don't leave the upload behind
                Storage::disk(self::DISK)->delete("{$directory}/{$filename}");
                throw ValidationException::withMessages(['file' => 'This image could not be read. Please upload a valid JPG, PNG, WebP or GIF file.']);
            }
            $attributes = array_merge($attributes, $processed);
        }

        return $attributes;
    }

    private function titleFrom(string $originalName): string
    {
        return Str::headline(pathinfo($originalName, PATHINFO_FILENAME));
    }
}
