<?php

namespace Database\Factories;

use App\Models\ContentSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentSection>
 */
class ContentSectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => 'culture',
            'data' => [
                'word1' => fake()->word(),
                'word2' => fake()->word(),
                'caption' => fake()->sentence(),
            ],
        ];
    }
}
