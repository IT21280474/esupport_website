<?php

namespace App\Http\Controllers\Api\Admin;

use App\Cms\Field;
use App\Cms\Icons;
use App\Cms\SectionRegistry;
use App\Cms\SectionSchema;
use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Page::withCount([
                'sections',
                'sections as enabled_sections_count' => fn ($q) => $q->where('is_enabled', true),
            ])->orderBy('id')->get(),
        ]);
    }

    /** Page with every section (raw content) plus previews for referenced media. */
    public function show(Page $page): JsonResponse
    {
        $sections = $page->sections()->get();

        $mediaIds = $sections->flatMap(fn (PageSection $s) => SectionRegistry::exists($s->type)
            ? SectionSchema::mediaIds(SectionRegistry::get($s->type)['fields'], $s->content ?? [])
            : [])->push($page->og_image_id)->filter()->unique();

        return response()->json([
            'data' => [
                ...$page->toArray(),
                'sections' => $sections->map(fn (PageSection $s) => $this->sectionPayload($s))->all(),
            ],
            'media' => Media::whereKey($mediaIds)->get()->mapWithKeys(fn (Media $m) => [$m->id => $m->toPublicArray()]),
        ]);
    }

    public function update(Request $request, Page $page): JsonResponse
    {
        $page->update($request->validate([
            'title' => ['required', 'string', 'max:190'],
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'og_image_id' => ['nullable', 'integer', 'exists:media,id'],
            'theme' => ['required', Rule::in(Page::THEMES)],
            'floating_whatsapp' => ['nullable', Rule::in(array_filter(array_keys(Field::WHATSAPP_DESKS)))],
            'is_published' => ['boolean'],
        ]));

        return response()->json(['data' => $page->refresh()]);
    }

    /** Catalogue of section types for the "Add section" picker and the edit forms. */
    public function sectionTypes(): JsonResponse
    {
        return response()->json([
            'types' => SectionRegistry::forAdmin(),
            'icons' => Icons::ALL,
            'art' => Field::ART,
        ]);
    }

    /** @return array<string, mixed> */
    public static function sectionPayload(PageSection $section): array
    {
        return [
            'id' => $section->id,
            'page_id' => $section->page_id,
            'type' => $section->type,
            'type_label' => SectionRegistry::get($section->type)['label'] ?? $section->type,
            'name' => $section->name,
            'anchor' => $section->anchor,
            'content' => $section->content ?? (object) [],
            'sort_order' => $section->sort_order,
            'is_enabled' => $section->is_enabled,
            'updated_at' => $section->updated_at,
        ];
    }
}
