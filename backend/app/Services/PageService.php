<?php

namespace App\Services;

use App\Cms\SectionDataResolver;
use App\Cms\SectionRegistry;
use App\Cms\SectionSchema;
use App\Models\Media;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Support\Collection;

/**
 * Builds the public payload for a CMS page: SEO meta plus enabled sections,
 * with media resolved and live data attached.
 */
class PageService
{
    public function __construct(private SectionDataResolver $data) {}

    /** @return array<string, mixed> */
    public function publicPayload(Page $page): array
    {
        $sections = $page->sections()->where('is_enabled', true)->get()
            ->filter(fn (PageSection $section) => SectionRegistry::exists($section->type))
            ->values();

        $media = $this->mediaFor($sections, $page->og_image_id);

        return [
            'slug' => $page->slug,
            'title' => $page->title,
            'theme' => $page->theme,
            'floating_whatsapp' => $page->floating_whatsapp,
            'seo' => [
                'title' => $page->meta_title,
                'description' => $page->meta_description,
                'image' => $page->og_image_id ? ($media[$page->og_image_id] ?? null) : null,
            ],
            'sections' => $sections->map(fn (PageSection $section) => $this->sectionPayload($section, $media))->all(),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $media
     * @return array<string, mixed>
     */
    private function sectionPayload(PageSection $section, array $media): array
    {
        $definition = SectionRegistry::get($section->type);
        $content = SectionSchema::sanitize($definition['fields'], $section->content ?? []);

        return [
            'id' => $section->id,
            'type' => $section->type,
            'anchor' => $section->anchor,
            'content' => SectionSchema::resolveMedia($definition['fields'], $content, $media),
            'data' => isset($definition['data']) ? $this->data->resolve($definition['data'], $content) : null,
        ];
    }

    /**
     * Load every media item referenced by the page in one query.
     *
     * @param  Collection<int, PageSection>  $sections
     * @return array<int, array<string, mixed>>
     */
    private function mediaFor(Collection $sections, ?int $ogImageId): array
    {
        $ids = $sections->flatMap(fn (PageSection $section) => SectionSchema::mediaIds(
            SectionRegistry::get($section->type)['fields'],
            $section->content ?? [],
        ))->push($ogImageId)->filter()->unique()->all();

        return Media::whereKey($ids)->get()
            ->mapWithKeys(fn (Media $media) => [$media->id => $media->toPublicArray()])
            ->all();
    }
}
