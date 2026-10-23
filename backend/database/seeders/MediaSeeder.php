<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use RuntimeException;

/**
 * Imports the images that shipped with the HTML prototype (database/seeders/assets)
 * into the media library, with the prototype's alt text.
 *
 * NOTE: apart from the logo, these are illustrative images from the prototype.
 * Replace them with the client's own photographs via Admin → Media → Replace.
 */
class MediaSeeder extends Seeder
{
    /** key => [file, alt text] */
    public const ASSETS = [
        'logo-emblem' => ['logo-emblem.png', 'Muthumala Group logo'],
        'logo-official' => ['logo-official.png', 'Muthumala Group of Companies official logo'],
        'hero-fleet' => ['hero-fleet-lineup.webp', 'Commercial vehicle lineup: Tata coach, Ashok Leyland city bus, Tata heavy-duty tipper truck and Ashok Leyland coach'],
        'lorry' => ['lorry.webp', 'Commercial goods lorry with canvas-covered cargo deck'],
        'bus' => ['bus.webp', 'Sri Lankan-style passenger bus'],
        'lanka-bus' => ['lanka-bus.webp', 'Lanka Ashok Leyland passenger bus on a hill-country road'],
        'tipper' => ['tipper.webp', 'Heavy-duty 6x4 tipper truck'],
        'road' => ['road.webp', 'Bus and goods lorry on a winding hill-country highway at sunset'],
        'parts' => ['parts.webp', 'Commercial vehicle spare parts: brake drum and disc, clutch, filters, bearings and gears'],
        'hotel-exterior' => ['hotel-exterior.webp', 'Colonial-style Sri Lankan hotel with verandas and tropical garden at sunset'],
        'hotel-room' => ['hotel-room.webp', 'Hotel guest room with king bed, warm wood and tropical garden view'],
        'hotel-beach' => ['hotel-beach.webp', 'Golden sunset on the beach near the hotel'],
        'hotel-bed' => ['hotel-bed.webp', 'Guest room with a king bed, blue cushions and fresh towels'],
        'hotel-bed-detail' => ['hotel-bed-detail.webp', 'Comfortable guest bed with elephant artwork and bedside lamp'],
        'hotel-dining' => ['hotel-dining.webp', 'Teak dining table and chairs in a guest suite'],
        'hotel-kitchenette' => ['hotel-kitchenette.webp', 'Modern kitchenette with sink and kettle'],
        'hotel-tray' => ['hotel-tray.webp', 'Tea and coffee tray in the guest room'],
        'csr-books' => ['csr-books.webp', 'Volunteers distributing school books to students at a Sri Lankan school'],
        // Logos of brands Muthumala distributes, supplied by the client
        'brand-pix' => ['brand-pix.png', 'PIX Transmissions logo'],
        'brand-nico' => ['brand-nico.png', 'NICO logo'],
        'brand-super-seal' => ['brand-super-seal.png', 'Super Seal oil seals logo'],
        'brand-banco' => ['brand-banco.png', 'BANCO logo'],
        'brand-jei' => ['brand-jei.png', 'JEI Bearings logo'],
        'brand-rmoss' => ['brand-rmoss.png', 'RMOSS logo'],
        'brand-rane' => ['brand-rane.png', 'Rane logo'],
    ];

    /** @var array<string, int> */
    private static array $ids = [];

    public function run(MediaService $media): void
    {
        foreach (self::ASSETS as $key => [$file, $alt]) {
            $existing = Media::where('original_name', $file)->first();

            self::$ids[$key] = $existing?->id ?? $media->store(
                new UploadedFile(__DIR__.'/assets/'.$file, $file, null, null, true),
                ['alt' => $alt],
            )->id;
        }
    }

    /** Media id of a seeded asset (MediaSeeder must have run first). */
    public static function id(string $key): int
    {
        return self::$ids[$key] ?? Media::where('original_name', self::ASSETS[$key][0] ?? '')->value('id')
            ?? throw new RuntimeException("Seed asset [{$key}] has not been imported.");
    }
}
