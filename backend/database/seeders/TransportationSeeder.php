<?php

namespace Database\Seeders;

use App\Models\FleetItem;
use App\Models\TransportationService;
use App\Models\VehicleType;
use Illuminate\Database\Seeder;

class TransportationSeeder extends Seeder
{
    public function run(): void
    {
        if (TransportationService::exists()) {
            return;
        }

        foreach ([
            ['Passenger Transport', 'users', 'Comfortable bus services for staff transport, schools, pilgrimages and group travel.'],
            ['Goods Transport', 'truck', 'Dependable lorry transport for commercial goods, distribution and bulk deliveries.'],
            ['Construction & Haulage', 'fleet', 'Tipper hire for sand, metal, soil and construction material on sites across the region.'],
        ] as $position => [$title, $icon, $description]) {
            TransportationService::create([
                'title' => $title, 'icon' => $icon, 'description' => $description,
                'sort_order' => $position, 'is_active' => true, 'is_featured' => true,
            ]);
        }

        // The five tiles of the prototype's fleet mosaic. Capacity and other
        // vehicle details are left empty until the client supplies them.
        $types = VehicleType::pluck('id', 'slug');
        foreach ([
            ['Fleet', null, 'road'],
            ['Buses', 'buses', 'bus'],
            ['Lorries', 'lorries', 'lorry'],
            ['Tippers', 'tippers', 'tipper'],
            ['On the road', null, 'road'],
        ] as $position => [$name, $type, $image]) {
            FleetItem::create([
                'name' => $name,
                'vehicle_type_id' => $type ? $types[$type] : null,
                'image_id' => MediaSeeder::id($image),
                'sort_order' => $position,
                'is_active' => true,
            ]);
        }
    }
}
