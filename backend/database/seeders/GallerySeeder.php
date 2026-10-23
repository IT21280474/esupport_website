<?php

namespace Database\Seeders;

use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        if (GalleryAlbum::exists()) {
            return;
        }

        $albums = collect(['Spare Parts', 'Transportation', 'Hotel', 'CSR', 'Company', 'Events', 'Other'])
            ->mapWithKeys(fn ($name, $position) => [$name => GalleryAlbum::create([
                'name' => $name, 'sort_order' => $position, 'is_active' => true,
            ])->id]);

        // Prototype gallery items that have an image available locally
        foreach ([
            ['Spare Parts', 'Spare parts store', 'parts', true],
            ['Transportation', 'Bus fleet', 'lanka-bus', true],
            ['Hotel', 'Hotel exterior', 'hotel-exterior', true],
            ['CSR', 'Community project', 'csr-books', true],
            ['Spare Parts', 'Lorry parts', 'lorry', false],
            ['Transportation', 'Tipper at work', 'tipper', true],
            ['Hotel', 'Guest room', 'hotel-bed', false],
            ['Transportation', 'On the road', 'road', true],
            ['Hotel', 'Dining', 'hotel-dining', false],
            ['Hotel', 'By the beach', 'hotel-beach', false],
            ['Transportation', 'Passenger bus', 'bus', false],
            ['Hotel', 'Room details', 'hotel-tray', false],
        ] as $position => [$album, $title, $image, $featured]) {
            GalleryImage::create([
                'gallery_album_id' => $albums[$album],
                'media_id' => MediaSeeder::id($image),
                'title' => $title,
                'is_featured' => $featured,
                'is_active' => true,
                'sort_order' => $position,
            ]);
        }
    }
}
