<?php

namespace App\Support\Media;

use App\Models\Media;
use App\Models\User;
use GdImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Decodes uploaded images with GD and re-encodes them as WebP.
 *
 * Re-encoding strips metadata and defuses malformed or disguised files (e.g. SVG/HTML).
 */
class ImageStore
{
    public const MAX_BYTES = 15 * 1024 * 1024;

    public const MAX_DIMENSION = 2400;

    private const ALLOWED_TYPES = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF, IMAGETYPE_AVIF];

    public function store(string $binary, string $originalName, ?User $uploader, int $maxDimension = self::MAX_DIMENSION): Media
    {
        if (strlen($binary) > self::MAX_BYTES) {
            throw new MediaException('File is larger than 15 MB.');
        }

        $info = @getimagesizefromstring($binary);
        if ($info === false || ! in_array($info[2], self::ALLOWED_TYPES, true)) {
            throw new MediaException('Unsupported image type. Use JPG, PNG, WebP, GIF or AVIF.');
        }

        $image = @imagecreatefromstring($binary);
        if (! $image instanceof GdImage) {
            throw new MediaException('That file is not a readable image.');
        }

        $image = $this->fitWithin($image, $maxDimension);
        $webp = $this->encodeWebp($image);

        $filename = sprintf('%s-%s-%s.webp', base_convert((string) time(), 10, 36), Str::lower(Str::random(6)), $this->slug($originalName));
        Storage::disk('public')->put('uploads/'.$filename, $webp);

        return Media::query()->create([
            'filename' => $filename,
            'original_name' => mb_substr($originalName, 0, 200),
            'mime' => 'image/webp',
            'size' => strlen($webp),
            'width' => imagesx($image),
            'height' => imagesy($image),
            'uploaded_by' => $uploader?->id,
        ]);
    }

    public function delete(Media $media): void
    {
        Storage::disk('public')->delete($media->storagePath());
        $media->delete();
    }

    private function fitWithin(GdImage $image, int $maxDimension): GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, $maxDimension / max($width, $height));

        if ($scale >= 1) {
            return $image;
        }

        $resized = imagescale($image, max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale)), IMG_BICUBIC);

        return $resized instanceof GdImage ? $resized : $image;
    }

    private function encodeWebp(GdImage $image): string
    {
        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        ob_start();
        imagewebp($image, null, 80);

        return (string) ob_get_clean();
    }

    private function slug(string $name): string
    {
        $base = preg_replace('/\.[a-z0-9]{2,5}$/i', '', $name) ?? $name;

        return Str::limit(Str::slug($base), 40, '') ?: 'image';
    }
}
