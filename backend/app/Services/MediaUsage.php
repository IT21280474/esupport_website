<?php

namespace App\Services;

use App\Cms\SectionRegistry;
use App\Cms\SectionSchema;
use App\Cms\SettingsRegistry;
use App\Models\Media;
use App\Models\PageSection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Finds where a media item is used, so the admin can see the impact before
 * deleting or replacing it.
 */
class MediaUsage
{
    /** table => media columns */
    private const COLUMNS = [
        'products' => ['image_id'],
        'product_categories' => ['image_id'],
        'vehicle_types' => ['image_id'],
        'brands' => ['logo_id'],
        'transportation_services' => ['image_id'],
        'fleet_items' => ['image_id'],
        'hotel_rooms' => ['image_id'],
        'gallery_albums' => ['cover_id'],
        'csr_projects' => ['image_id'],
        'pages' => ['og_image_id'],
    ];

    public function __construct(private SettingsService $settings) {}

    /** @return array<int, string> human-readable places */
    public function for(Media $media): array
    {
        $places = [];

        foreach (self::COLUMNS as $table => $columns) {
            foreach ($columns as $column) {
                $count = DB::table($table)->where($column, $media->id)->count();
                if ($count) {
                    $places[] = Str::headline($table).' ('.$count.')';
                }
            }
        }

        $galleries = DB::table('mediables')->where('media_id', $media->id)->count();
        if ($galleries) {
            $places[] = "Image galleries ({$galleries})";
        }

        $galleryImages = DB::table('gallery_images')->where('media_id', $media->id)->count();
        if ($galleryImages) {
            $places[] = "Website gallery ({$galleryImages})";
        }

        PageSection::with('page:id,title')->get()->each(function (PageSection $section) use ($media, &$places) {
            $definition = SectionRegistry::get($section->type);
            if ($definition && in_array($media->id, SectionSchema::mediaIds($definition['fields'], $section->content ?? []), true)) {
                $places[] = 'Page “'.$section->page?->title.'” — '.($section->name ?: $definition['label']);
            }
        });

        $settings = $this->settings->grouped();
        foreach (SettingsRegistry::groups() as $group => $definition) {
            if (in_array($media->id, SectionSchema::mediaIds($definition['fields'], $settings[$group] ?? []), true)) {
                $places[] = "Settings → {$definition['label']}";
            }
        }

        return $places;
    }
}
