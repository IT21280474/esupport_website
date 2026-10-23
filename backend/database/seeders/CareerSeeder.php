<?php

namespace Database\Seeders;

use App\Enums\CareerStatus;
use App\Enums\EmploymentType;
use App\Models\Career;
use Illuminate\Database\Seeder;

/**
 * The three openings listed in the prototype. TO CONFIRM WITH CLIENT before
 * launch: set them to Draft or Closed in Admin → Careers if they are not current.
 */
class CareerSeeder extends Seeder
{
    public function run(): void
    {
        if (Career::exists()) {
            return;
        }

        foreach ([
            ['Sales Executive — Spare Parts', 'Spare Parts', 'Advise customers on Tata and Leyland parts and grow relationships with workshops and fleet owners.'],
            ['Graphic Designer', 'Marketing', 'Create social media posts, product promotions and marketing material for the group.'],
            ['Stores Assistant', 'Spare Parts', 'Manage stock, receive deliveries and keep the parts store organised and accurate.'],
        ] as $position => [$title, $department, $summary]) {
            Career::create([
                'title' => $title,
                'department' => $department,
                'location' => 'Colombo 13',
                'employment_type' => EmploymentType::FullTime,
                'summary' => $summary,
                'description' => '<p>'.e($summary).'</p>',
                'status' => CareerStatus::Published,
                'sort_order' => $position,
            ]);
        }
    }
}
