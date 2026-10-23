<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\ProductCategory;
use App\Models\VehicleType;
use Illuminate\Database\Seeder;

/**
 * Spare-parts taxonomy from the prototype. No products are seeded: the client
 * adds real products (names, part numbers, specs) through the admin panel.
 */
class CatalogueSeeder extends Seeder
{
    public function run(): void
    {
        if (ProductCategory::exists()) {
            return;
        }

        foreach ([
            ['Lorries', 'lorries', 'lorry', 'Commercial vehicle spare parts and components.'],
            ['Buses', 'buses', 'bus', 'Parts and components for passenger buses.'],
            ['Tippers', 'tippers', 'tipper', 'Heavy-duty parts for construction and haulage tippers.'],
        ] as $position => [$name, $slug, $image, $description]) {
            VehicleType::create([
                'name' => $name, 'slug' => $slug, 'description' => $description,
                'image_id' => MediaSeeder::id($image), 'sort_order' => $position, 'is_active' => true,
            ]);
        }

        foreach ([
            ['Engine Components', 'engine'], ['Brake Components', 'brake'], ['Clutch Components', 'clutch'],
            ['Suspension Components', 'spring'], ['Steering Components', 'steering'], ['Electrical Components', 'bolt'],
            ['Cooling System', 'cooling'], ['Transmission Components', 'gears'], ['Filters', 'filter'],
            ['Belts', 'belt'], ['Bearings', 'bearing'], ['Lighting', 'light'], ['Body Components', 'body'],
        ] as $position => [$name, $icon]) {
            ProductCategory::create(['name' => $name, 'icon' => $icon, 'sort_order' => $position, 'is_active' => true]);
        }

        // Brands imported and distributed by Muthumala: the logo brands were supplied by
        // the client (logos included); WABCO, Usha and Bimetal are named in the prototype.
        foreach ([
            ['PIX', 'Power transmission', 'brand-pix'], ['NICO', null, 'brand-nico'],
            ['Super Seal', 'Oil seals', 'brand-super-seal'], ['BANCO', null, 'brand-banco'],
            ['JEI', 'Bearings', 'brand-jei'], ['RMOSS', null, 'brand-rmoss'], ['Rane', 'Brake liners', 'brand-rane'],
            ['WABCO', 'Brake repair kits', null], ['Usha', 'Pistons, rings & filters', null], ['Bimetal', 'Bearings', null],
        ] as $position => [$name, $description, $logo]) {
            Brand::create([
                'name' => $name, 'description' => $description, 'logo_id' => $logo ? MediaSeeder::id($logo) : null,
                'sort_order' => $position, 'is_active' => true,
            ]);
        }
    }
}
