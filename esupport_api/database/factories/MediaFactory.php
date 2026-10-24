<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'filename' => fake()->unique()->slug(2).'.webp',
            'original_name' => fake()->word().'.jpg',
            'mime' => 'image/webp',
            'size' => fake()->numberBetween(10_000, 500_000),
            'width' => 1200,
            'height' => 800,
        ];
    }
}
