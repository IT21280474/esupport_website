<?php

namespace Database\Seeders;

use App\Models\CsrCategory;
use App\Models\CsrProject;
use Illuminate\Database\Seeder;

/**
 * CSR focus areas and the three initiatives described in the prototype.
 * Dates, locations and impact figures are intentionally left empty until the
 * client provides verified details.
 */
class CsrSeeder extends Seeder
{
    public function run(): void
    {
        if (CsrCategory::exists()) {
            return;
        }

        $categories = collect([
            ['Community Development', 'users'],
            ['Education', 'book'],
            ['Environment', 'leaf'],
            ['Health & Wellbeing', 'heart'],
            ['Social Initiatives', 'globe'],
            ['Community Support', 'hand'],
        ])->mapWithKeys(fn ($category, $position) => [$category[0] => CsrCategory::create([
            'name' => $category[0], 'icon' => $category[1],
            'description' => 'Part of our ongoing commitment',
            'sort_order' => $position, 'is_active' => true,
        ])->id]);

        foreach ([
            [
                'Supporting local schools', 'Education',
                'School supplies, learning resources and encouragement for students in the communities around our branches.',
                'csr-books',
            ],
            [
                'Community clean-up & support', 'Community Development',
                'Volunteering our time alongside neighbours to keep shared spaces clean, safe and welcoming.',
                null,
            ],
            [
                'Tree planting for a greener Sri Lanka', 'Environment',
                'Planting trees and caring for green spaces along the roads our vehicles travel every day.',
                null,
            ],
        ] as $position => [$title, $category, $excerpt, $image]) {
            CsrProject::create([
                'title' => $title,
                'csr_category_id' => $categories[$category],
                'excerpt' => $excerpt,
                'description' => '<p>'.e($excerpt).'</p>',
                'date_label' => 'Ongoing initiative',
                'image_id' => $image ? MediaSeeder::id($image) : null,
                'sort_order' => $position,
                'is_active' => true,
                'is_featured' => true,
            ]);
        }
    }
}
