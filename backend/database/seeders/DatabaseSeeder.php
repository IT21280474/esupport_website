<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seeds roles, the first admin, settings and the website content taken
     * from the HTML prototype. Safe to re-run: each seeder skips existing data.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            MediaSeeder::class,
            SettingsSeeder::class,
            CatalogueSeeder::class,
            TransportationSeeder::class,
            HotelSeeder::class,
            CsrSeeder::class,
            GallerySeeder::class,
            CareerSeeder::class,
            PageSeeder::class,
        ]);
    }
}
