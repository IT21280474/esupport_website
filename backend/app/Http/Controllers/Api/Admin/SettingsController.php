<?php

namespace App\Http\Controllers\Api\Admin;

use App\Cms\SectionSchema;
use App\Cms\SettingsRegistry;
use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\SocialLink;
use App\Services\ActivityLogger;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function __construct(private SettingsService $settings) {}

    public function show(): JsonResponse
    {
        $values = $this->settings->grouped();
        $groups = SettingsRegistry::groups();

        $mediaIds = collect($values)->flatMap(fn ($v, $group) => SectionSchema::mediaIds($groups[$group]['fields'], $v));

        return response()->json([
            'groups' => SettingsRegistry::forAdmin(),
            'values' => $values,
            'media' => Media::whereKey($mediaIds)->get()->mapWithKeys(fn (Media $m) => [$m->id => $m->toPublicArray()]),
            'social' => $this->socialLinks(),
        ]);
    }

    public function update(Request $request, string $group): JsonResponse
    {
        $definition = SettingsRegistry::groups()[$group] ?? abort(404);
        $values = $request->validate(SectionSchema::rules($definition['fields'], 'values'))['values'] ?? [];

        $changed = $this->settings->updateGroup($group, $values);

        if ($changed) {
            ActivityLogger::log('settings_updated', "Updated {$definition['label']} settings", null, ['fields' => $changed]);
        }

        return response()->json([
            'message' => $changed ? 'Settings saved.' : 'No changes to save.',
            'values' => $this->settings->grouped()[$group],
        ]);
    }

    public function updateSocial(Request $request): JsonResponse
    {
        $links = $request->validate([
            'links' => ['required', 'array'],
            'links.*.platform' => ['required', Rule::in(SocialLink::PLATFORMS)],
            'links.*.url' => ['nullable', 'url:https', 'max:500'],
            'links.*.is_active' => ['boolean'],
        ])['links'];

        DB::transaction(function () use ($links) {
            foreach ($links as $position => $link) {
                SocialLink::updateOrCreate(
                    ['platform' => $link['platform']],
                    ['url' => $link['url'] ?? null, 'is_active' => $link['is_active'] ?? true, 'sort_order' => $position],
                );
            }
        });

        return response()->json(['message' => 'Social links saved.', 'social' => $this->socialLinks()]);
    }

    /** @return array<int, array<string, mixed>> one row per supported platform */
    private function socialLinks(): array
    {
        $stored = SocialLink::all()->keyBy('platform');

        return collect(SocialLink::PLATFORMS)
            ->map(fn (string $platform) => [
                'platform' => $platform,
                'url' => $stored[$platform]->url ?? null,
                'is_active' => $stored[$platform]->is_active ?? true,
                'sort_order' => $stored[$platform]->sort_order ?? 99,
            ])
            ->sortBy('sort_order')
            ->values()
            ->all();
    }
}
