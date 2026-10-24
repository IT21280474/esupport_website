<?php

namespace Database\Seeders;

use App\Models\ContentSection;
use App\Models\Media;
use App\Models\User;
use App\Role;
use App\Support\Content\ContentRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Loads the content that was set up in the admin panel and the images it uses (database/seeders/content):
 * the Hero, Navigation and Portfolio sections, plus their uploaded images.
 *
 * Safe to run again. Images are only copied when missing, and a section that already has content is left
 * alone unless SEED_OVERWRITE_CONTENT=true. A replaced version stays in the section's History, so it can
 * be restored from the admin panel.
 */
class ContentSeeder extends Seeder
{
    private const MEDIA_FIELDS = ['original_name', 'mime', 'size', 'width', 'height'];

    public function run(ContentRepository $content): void
    {
        $snapshot = json_decode(File::get(database_path('seeders/content/snapshot.json')), true, flags: JSON_THROW_ON_ERROR);
        $admin = $this->admin();

        $this->seedMedia($snapshot['media'] ?? [], $admin);
        $this->seedSections($content, $snapshot['sections'] ?? [], $admin);
    }

    /**
     * The user the seeded content is recorded under (the first administrator, created if there is none).
     */
    private function admin(): User
    {
        $query = fn () => User::query()->where('role', Role::Admin->value)->orderBy('id');

        if (! $query()->exists()) {
            $this->call(AdminUserSeeder::class);
        }

        return $query()->firstOrFail();
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function seedMedia(array $items, User $admin): void
    {
        $disk = Storage::disk('public');

        foreach ($items as $item) {
            $filename = $item['filename'];
            $source = database_path('seeders/content/uploads/'.$filename);

            if (! is_file($source)) {
                $this->command?->warn("Image {$filename} is missing from database/seeders/content/uploads — skipped.");

                continue;
            }

            if (! $disk->exists('uploads/'.$filename)) {
                $disk->put('uploads/'.$filename, File::get($source));
                $this->command?->info("Image copied: {$filename}");
            }

            Media::query()->firstOrCreate(
                ['filename' => $filename],
                [...Arr::only($item, self::MEDIA_FIELDS), 'uploaded_by' => $admin->id],
            );
        }
    }

    /**
     * @param  array<string, array<string, mixed>>  $sections
     */
    private function seedSections(ContentRepository $content, array $sections, User $admin): void
    {
        $overwrite = filter_var(env('SEED_OVERWRITE_CONTENT', false), FILTER_VALIDATE_BOOLEAN);

        foreach ($sections as $key => $data) {
            if (! $overwrite && ContentSection::query()->where('key', $key)->exists()) {
                $this->command?->warn("Section \"{$key}\" already has content — left unchanged. Set SEED_OVERWRITE_CONTENT=true to replace it.");

                continue;
            }

            $content->save($key, $data, $admin);
            $this->command?->info("Section \"{$key}\" loaded.");
        }
    }
}
