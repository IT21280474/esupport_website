<?php

namespace App\Http\Controllers\Api\Admin;

use App\Cms\SectionRegistry;
use App\Cms\SectionSchema;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Page builder: add, edit, enable/disable, reorder, duplicate and remove sections.
 * Content is validated and sanitised against the section type's schema.
 */
class PageSectionController extends Controller
{
    public function store(Request $request, Page $page): JsonResponse
    {
        $type = $request->validate(['type' => ['required', 'string', Rule::in(array_keys(SectionRegistry::all()))]])['type'];

        // New sections always start as hidden drafts, so required fields are
        // enforced when the section is saved or switched on — not here.
        $data = $this->validated($request, $type, strict: false);

        $section = $page->sections()->create([
            ...$data,
            'type' => $type,
            'is_enabled' => false,
            'sort_order' => $request->has('position')
                ? $this->makeRoomAt($page, $request->integer('position'))
                : (int) $page->sections()->max('sort_order') + 1,
        ]);

        return response()->json(['data' => PageController::sectionPayload($section->refresh())], 201);
    }

    public function update(Request $request, PageSection $section): JsonResponse
    {
        $section->update($this->validated($request, $section->type));

        return response()->json(['data' => PageController::sectionPayload($section->refresh())]);
    }

    public function toggle(PageSection $section): JsonResponse
    {
        if (! $section->is_enabled) {
            $this->assertComplete($section);
        }

        $section->update(['is_enabled' => ! $section->is_enabled]);

        return response()->json(['data' => PageController::sectionPayload($section)]);
    }

    /** A draft can only go live once its required fields are filled in. */
    private function assertComplete(PageSection $section): void
    {
        $fields = SectionRegistry::get($section->type)['fields'] ?? [];
        $validator = Validator::make(['content' => $section->content ?? []], SectionSchema::rules($fields));

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                'is_enabled' => 'Fill in the required fields and save the section before showing it on the website.',
            ]);
        }
    }

    public function duplicate(PageSection $section): JsonResponse
    {
        $copy = DB::transaction(function () use ($section) {
            PageSection::where('page_id', $section->page_id)
                ->where('sort_order', '>', $section->sort_order)
                ->increment('sort_order');

            return PageSection::create([
                ...$section->only(['page_id', 'type', 'content']),
                'name' => trim(($section->name ?: SectionRegistry::get($section->type)['label'] ?? '').' (copy)'),
                'anchor' => null,
                'sort_order' => $section->sort_order + 1,
                'is_enabled' => false,
            ]);
        });

        return response()->json(['data' => PageController::sectionPayload($copy)], 201);
    }

    public function reorder(Request $request, Page $page): JsonResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', Rule::exists('page_sections', 'id')->where('page_id', $page->id)],
        ])['ids'];

        DB::transaction(function () use ($ids) {
            foreach ($ids as $position => $id) {
                PageSection::whereKey($id)->first()?->update(['sort_order' => $position]);
            }
        });

        return response()->json(['message' => 'Section order saved.']);
    }

    public function destroy(PageSection $section): JsonResponse
    {
        $section->delete();

        return response()->json(['message' => 'Section removed.']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, string $type, bool $strict = true): array
    {
        $fields = SectionRegistry::get($type)['fields'];

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'anchor' => ['nullable', 'string', 'max:60', 'alpha_dash:ascii'],
            'is_enabled' => ['boolean'],
            ...SectionSchema::rules($fields, strict: $strict),
        ]);

        $data['content'] = SectionSchema::sanitize($fields, $data['content'] ?? []);

        return $data;
    }

    private function makeRoomAt(Page $page, int $position): int
    {
        $page->sections()->where('sort_order', '>=', $position)->increment('sort_order');

        return $position;
    }
}
