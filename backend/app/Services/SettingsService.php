<?php

namespace App\Services;

use App\Cms\SectionSchema;
use App\Cms\SettingsRegistry;
use App\Models\Media;
use App\Models\Setting;
use App\Support\ContentCache;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'settings:all';

    /** @return array<string, array<string, mixed>> group => key => value */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $values = [];
            foreach (Setting::all() as $setting) {
                Arr::set($values, $setting->key, $setting->value);
            }

            return $values;
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Arr::get($this->all(), $key, $default);
    }

    /**
     * Values for every group, with blanks for settings that were never saved.
     *
     * @return array<string, array<string, mixed>>
     */
    public function grouped(bool $publicOnly = false): array
    {
        $stored = $this->all();
        $grouped = [];

        foreach (SettingsRegistry::groups() as $group => $definition) {
            if ($publicOnly && ! $definition['public']) {
                continue;
            }

            $grouped[$group] = SectionSchema::sanitize($definition['fields'], $stored[$group] ?? []);
        }

        return $grouped;
    }

    /**
     * Public website payload with media resolved.
     *
     * @return array<string, array<string, mixed>>
     */
    public function publicPayload(): array
    {
        $groups = $this->grouped(publicOnly: true);
        $definitions = SettingsRegistry::groups();

        $mediaIds = [];
        foreach ($groups as $group => $values) {
            array_push($mediaIds, ...SectionSchema::mediaIds($definitions[$group]['fields'], $values));
        }

        $media = Media::whereKey($mediaIds)->get()->mapWithKeys(fn (Media $m) => [$m->id => $m->toPublicArray()])->all();

        foreach ($groups as $group => $values) {
            $groups[$group] = SectionSchema::resolveMedia($definitions[$group]['fields'], $values, $media);
        }

        return $groups;
    }

    /**
     * Save one group's values (already validated).
     *
     * @param  array<string, mixed>  $values
     * @return array<int, string> keys that changed
     */
    public function updateGroup(string $group, array $values): array
    {
        $definition = SettingsRegistry::groups()[$group];
        $clean = SectionSchema::sanitize($definition['fields'], $values);
        $current = $this->grouped()[$group] ?? [];
        $changed = [];

        foreach ($clean as $key => $value) {
            if (($current[$key] ?? null) === $value) {
                continue;
            }

            Setting::updateOrCreate(
                ['key' => "{$group}.{$key}"],
                ['group' => $group, 'value' => $value, 'is_public' => $definition['public']],
            );
            $changed[] = $key;
        }

        if ($changed) {
            Cache::forget(self::CACHE_KEY);
            ContentCache::bump();
        }

        return $changed;
    }

    /** @return array<int, string> */
    public function emailList(string $key): array
    {
        return collect(explode(',', (string) $this->get($key, '')))
            ->map(fn ($email) => trim($email))
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->values()
            ->all();
    }
}
