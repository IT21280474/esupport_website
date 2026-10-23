<?php

namespace Database\Seeders;

use App\Enums\RoomStatus;
use App\Models\HotelAmenity;
use App\Models\HotelRoom;
use Illuminate\Database\Seeder;

/**
 * Rooms and amenities as shown in the prototype. No prices are seeded —
 * rates must come from the client.
 */
class HotelSeeder extends Seeder
{
    public function run(): void
    {
        if (HotelRoom::exists()) {
            return;
        }

        $amenities = collect([
            ['Wi-Fi', 'wifi', 'Stay connected throughout your stay.'],
            ['Restaurant', 'dining', 'Sri Lankan and international favourites.'],
            ['Parking', 'parking', 'On-site parking for guests.'],
            ['Front Desk', 'concierge', 'Friendly help whenever you need it.'],
        ])->map(fn ($amenity, $position) => HotelAmenity::create([
            'name' => $amenity[0], 'icon' => $amenity[1], 'description' => $amenity[2],
            'sort_order' => $position, 'is_active' => true,
        ]));

        foreach ([
            ['Standard Room', 'A calm, well-appointed room for business and short stays.', 2, 'Double bed', 'hotel-room'],
            ['Deluxe Room', 'More space to unwind, with a relaxed sitting area.', 2, 'King bed', 'hotel-bed'],
            ['Family Room', 'Room for the whole family, made for longer stays.', 4, 'Twin + double', 'hotel-bed-detail'],
        ] as $position => [$name, $description, $capacity, $bed, $image]) {
            $room = HotelRoom::create([
                'name' => $name, 'description' => $description, 'capacity' => $capacity, 'bed_type' => $bed,
                'image_id' => MediaSeeder::id($image), 'status' => RoomStatus::Available,
                'sort_order' => $position, 'is_active' => true, 'is_featured' => true,
            ]);
            $room->amenities()->sync($amenities->pluck('id'));
        }
    }
}
