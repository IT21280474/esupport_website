<?php

namespace Database\Factories;

use App\Models\ContentRevision;
use App\Models\User;
use App\RevisionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentRevision>
 */
class ContentRevisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'section_key' => 'culture',
            'data' => [
                'word1' => fake()->word(),
                'word2' => fake()->word(),
                'caption' => fake()->sentence(),
            ],
            'status' => RevisionStatus::Approved,
        ];
    }

    /**
     * Indicate that an editor submitted the revision and it awaits approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RevisionStatus::Pending,
            'user_id' => User::factory(),
        ]);
    }
}
