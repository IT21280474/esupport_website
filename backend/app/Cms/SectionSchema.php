<?php

namespace App\Cms;

use App\Rules\SafeUrl;
use App\Services\HtmlSanitizer;
use Illuminate\Validation\Rule;

/**
 * Interprets SectionRegistry field definitions: builds validation rules,
 * sanitises submitted content and swaps media ids for media payloads.
 */
final class SectionSchema
{
    /**
     * @param  array<int, array<string, mixed>>  $fields
     * @param  bool  $strict  false skips "required" (used when creating an empty draft section)
     * @return array<string, array<int, mixed>>
     */
    public static function rules(array $fields, string $prefix = 'content', bool $strict = true): array
    {
        $rules = [$prefix => ['nullable', 'array']];

        foreach ($fields as $field) {
            $path = $prefix.'.'.$field['key'];
            $presence = $strict && ! empty($field['required']) ? 'required' : 'nullable';

            $rules += match ($field['type']) {
                'text' => [$path => [$presence, 'string', 'max:255']],
                'textarea' => [$path => [$presence, 'string', 'max:5000']],
                'richtext' => [$path => [$presence, 'string', 'max:50000']],
                'url' => [$path => [$presence, 'string', 'max:500', new SafeUrl]],
                'media' => [$path => [$presence, 'integer', 'exists:media,id']],
                'select' => [$path => [$presence, 'string', Rule::in(array_map('strval', array_keys($field['options'])))]],
                'icon' => [$path => [$presence, 'string', Rule::in(Icons::ALL)]],
                'toggle' => [$path => ['nullable', 'boolean']],
                'number' => [$path => [$presence, 'integer', 'min:'.($field['min'] ?? 0), 'max:'.($field['max'] ?? 100000)]],
                'tags' => [
                    $path => [$presence, 'array', 'max:'.($field['max'] ?? 20)],
                    $path.'.*' => ['nullable', 'string', 'max:160'],
                ],
                'list' => [$path => [$presence, 'array', 'max:'.($field['max'] ?? 20)]]
                    + self::rules($field['fields'], $path.'.*', $strict),
            };
        }

        return $rules;
    }

    /**
     * Keep only known keys, normalise types and clean rich text.
     *
     * @param  array<int, array<string, mixed>>  $fields
     * @param  array<string, mixed>|null  $input
     * @return array<string, mixed>
     */
    public static function sanitize(array $fields, ?array $input): array
    {
        $output = [];

        foreach ($fields as $field) {
            $value = $input[$field['key']] ?? null;

            $output[$field['key']] = match ($field['type']) {
                'text', 'textarea', 'url', 'select', 'icon' => self::string($value),
                'richtext' => HtmlSanitizer::clean(is_string($value) ? $value : null) ?: null,
                'media', 'number' => is_numeric($value) ? (int) $value : null,
                'toggle' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'tags' => array_values(array_filter(array_map([self::class, 'string'], (array) $value))),
                'list' => array_values(array_map(
                    fn ($item) => self::sanitize($field['fields'], is_array($item) ? $item : []),
                    is_array($value) ? $value : [],
                )),
            };
        }

        return $output;
    }

    /**
     * @param  array<int, array<string, mixed>>  $fields
     * @param  array<string, mixed>  $content
     * @return array<int, int>
     */
    public static function mediaIds(array $fields, array $content): array
    {
        $ids = [];

        foreach ($fields as $field) {
            $value = $content[$field['key']] ?? null;

            if ($field['type'] === 'media' && is_int($value)) {
                $ids[] = $value;
            } elseif ($field['type'] === 'list' && is_array($value)) {
                foreach ($value as $item) {
                    array_push($ids, ...self::mediaIds($field['fields'], (array) $item));
                }
            }
        }

        return $ids;
    }

    /**
     * Replace media ids with their public payload (or null when missing).
     *
     * @param  array<int, array<string, mixed>>  $fields
     * @param  array<string, mixed>  $content
     * @param  array<int, array<string, mixed>>  $media  id => payload
     * @return array<string, mixed>
     */
    public static function resolveMedia(array $fields, array $content, array $media): array
    {
        foreach ($fields as $field) {
            $key = $field['key'];
            $value = $content[$key] ?? null;

            if ($field['type'] === 'media') {
                $content[$key] = is_int($value) ? ($media[$value] ?? null) : null;
            } elseif ($field['type'] === 'list' && is_array($value)) {
                $content[$key] = array_map(
                    fn ($item) => self::resolveMedia($field['fields'], (array) $item, $media),
                    $value,
                );
            }
        }

        return $content;
    }

    private static function string(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
