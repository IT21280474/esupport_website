<?php

namespace App\Services;

use GdImage;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Generates resized WebP variants of an uploaded image with PHP's GD extension
 * (no extra dependency). Variants never upscale the original.
 */
class ImageProcessor
{
    /**
     * @return array{width: int, height: int, variants: array<string, array{path: string, width: int, height: int}>}
     */
    public function process(string $disk, string $path): array
    {
        $absolute = Storage::disk($disk)->path($path);
        $info = @getimagesize($absolute);

        if ($info === false) {
            throw new RuntimeException('The uploaded file is not a readable image.');
        }

        $previousLimit = ini_get('memory_limit');
        ini_set('memory_limit', '512M');

        try {
            $image = $this->load($absolute, $info[2]);
            $image = $this->applyExifOrientation($image, $absolute, $info[2]);
            $width = imagesx($image);
            $height = imagesy($image);

            $variants = [];
            $lastEdge = null;
            $base = preg_replace('/\.[^.]+$/', '', $path);

            foreach (config('muthumala.image_variants') as $name => $edge) {
                $edge = min($edge, max($width, $height));
                if ($edge === $lastEdge) {
                    continue; // original is smaller than this size; previous variant already covers it
                }
                $lastEdge = $edge;

                $variants[$name] = $this->writeVariant($image, $disk, "{$base}-{$name}.webp", $edge, $width, $height);
            }

            return ['width' => $width, 'height' => $height, 'variants' => $variants];
        } finally {
            ini_set('memory_limit', $previousLimit);
        }
    }

    private function load(string $absolute, int $type): GdImage
    {
        $image = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($absolute),
            IMAGETYPE_PNG => @imagecreatefrompng($absolute),
            IMAGETYPE_WEBP => @imagecreatefromwebp($absolute),
            IMAGETYPE_GIF => @imagecreatefromgif($absolute),
            default => false,
        };

        if (! $image instanceof GdImage) {
            throw new RuntimeException('Unsupported image format.');
        }

        if (! imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }
        imagealphablending($image, false);
        imagesavealpha($image, true);

        return $image;
    }

    private function applyExifOrientation(GdImage $image, string $absolute, int $type): GdImage
    {
        if ($type !== IMAGETYPE_JPEG || ! function_exists('exif_read_data')) {
            return $image;
        }

        $orientation = @exif_read_data($absolute)['Orientation'] ?? 1;
        $angle = match ((int) $orientation) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        return $angle ? (imagerotate($image, $angle, 0) ?: $image) : $image;
    }

    /** @return array{path: string, width: int, height: int} */
    private function writeVariant(GdImage $source, string $disk, string $path, int $edge, int $width, int $height): array
    {
        $ratio = $edge / max($width, $height);
        $w = max(1, (int) round($width * $ratio));
        $h = max(1, (int) round($height * $ratio));

        $canvas = imagecreatetruecolor($w, $h);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $w, $h, $width, $height);

        ob_start();
        imagewebp($canvas, null, config('muthumala.image_quality'));
        Storage::disk($disk)->put($path, (string) ob_get_clean());

        return ['path' => $path, 'width' => $w, 'height' => $h];
    }
}
