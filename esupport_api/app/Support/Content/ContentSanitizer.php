<?php

namespace App\Support\Content;

/**
 * Coerces untrusted editor input into the exact shape the schema describes.
 *
 * Unknown keys are dropped, wrong types fall back to the default value and links are
 * limited to safe schemes (no javascript: URLs).
 */
class ContentSanitizer
{
    private const MAX_TEXT = 20_000;

    private const MAX_ITEMS = 500;

    public function __construct(private ContentSchema $schema) {}

    /**
     * @return array<string, mixed>
     */
    public function sanitizeSection(string $key, mixed $input): array
    {
        $fields = $this->schema->section($key)['fields'];
        $defaults = $this->schema->defaults($key);
        $root = $this->isObject($input) ? $input : [];

        /* Resolve root-level option lists (e.g. portfolio categories) first so list items can reference them. */
        $nonListFields = array_values(array_filter($fields, fn (array $field): bool => $field['kind'] !== 'list'));
        $firstPass = $this->sanitizeObject($nonListFields, $root, $defaults, []);

        return $this->sanitizeObject($fields, $root, $defaults, array_merge($root, $firstPass));
    }

    /**
     * Allows http(s), mailto, tel, site-relative paths and in-page anchors only.
     */
    public static function safeHref(mixed $value): string
    {
        $href = trim(mb_substr(is_scalar($value) ? (string) $value : '', 0, 2048));

        if ($href === '') {
            return '';
        }
        if (preg_match('/^(https?:|mailto:|tel:)/i', $href)) {
            return $href;
        }
        if (str_starts_with($href, '/') && ! str_starts_with($href, '//')) {
            return $href;
        }
        if (str_starts_with($href, '#')) {
            return $href;
        }

        return '';
    }

    /**
     * Image sources: absolute http(s) URLs or site-relative paths.
     */
    public static function safeImage(mixed $value): string
    {
        $src = trim(mb_substr(is_scalar($value) ? (string) $value : '', 0, 2048));

        if (preg_match('/^https?:\/\//i', $src)) {
            return $src;
        }
        if (str_starts_with($src, '/') && ! str_starts_with($src, '//')) {
            return $src;
        }

        return '';
    }

    /**
     * @param  list<array<string, mixed>>  $fields
     * @param  array<string, mixed>  $input
     * @param  array<string, mixed>  $defaults
     * @param  array<string, mixed>  $section
     * @return array<string, mixed>
     */
    private function sanitizeObject(array $fields, array $input, array $defaults, array $section): array
    {
        $output = [];

        foreach ($fields as $field) {
            $output[$field['key']] = $this->sanitizeField($field, $input[$field['key']] ?? null, $defaults[$field['key']] ?? null, $section);
        }

        return $output;
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  array<string, mixed>  $section
     */
    private function sanitizeField(array $field, mixed $value, mixed $fallback, array $section): mixed
    {
        return match ($field['kind']) {
            'text', 'textarea' => $this->text($value, $fallback),
            'url' => is_string($value) ? self::safeHref($value) : $this->text(null, $fallback),
            'image' => is_string($value) ? self::safeImage($value) : $this->text(null, $fallback),
            'color' => $this->color($value, $fallback),
            'number' => $this->number($field, $value, $fallback),
            'boolean' => is_bool($value) ? $value : (bool) $fallback,
            'select' => $this->select($field, $value, $fallback),
            'stringList' => $this->stringList($field, $value, $fallback),
            'multiSelect' => $this->multiSelect($field, $value, $section),
            'list' => $this->list($field, $value, $fallback, $section),
            'sections' => $this->layoutSections($value),
            default => null,
        };
    }

    private function text(mixed $value, mixed $fallback): string
    {
        if (is_string($value)) {
            return mb_substr($value, 0, self::MAX_TEXT);
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return is_scalar($fallback) ? (string) $fallback : '';
    }

    private function color(mixed $value, mixed $fallback): string
    {
        $color = is_string($value) ? trim($value) : '';

        return preg_match('/^#[0-9a-f]{3,8}$/i', $color) ? $color : (string) ($fallback ?? '#000000');
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function number(array $field, mixed $value, mixed $fallback): int|float
    {
        $number = is_numeric($value) ? (float) $value : (is_numeric($fallback) ? (float) $fallback : 0.0);

        if (isset($field['min'])) {
            $number = max((float) $field['min'], $number);
        }
        if (isset($field['max'])) {
            $number = min((float) $field['max'], $number);
        }

        return floor($number) === $number ? (int) $number : $number;
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function select(array $field, mixed $value, mixed $fallback): string
    {
        $choice = is_scalar($value) ? (string) $value : '';

        return in_array($choice, $field['options'], true) ? $choice : (string) ($fallback ?? $field['options'][0]);
    }

    /**
     * @param  array<string, mixed>  $field
     * @return list<string>
     */
    private function stringList(array $field, mixed $value, mixed $fallback): array
    {
        $source = is_array($value) && array_is_list($value) ? $value : (is_array($fallback) ? $fallback : []);
        $fixedLength = $field['fixedLength'] ?? null;
        $fallbackList = is_array($fallback) ? array_values($fallback) : [];

        $items = array_map(fn (mixed $item): string => $this->text($item, ''), array_slice($source, 0, self::MAX_ITEMS));

        if (! $fixedLength) {
            $items = array_values(array_filter($items, fn (string $item): bool => trim($item) !== ''));
        }

        if ($field['key'] === 'brandColors') {
            $items = array_map(
                fn (string $color, int $index): string => preg_match('/^#[0-9a-f]{3,8}$/i', trim($color))
                    ? trim($color)
                    : (string) ($fallbackList[$index] ?? '#000000'),
                $items,
                array_keys($items),
            );
        }

        if ($fixedLength) {
            $items = array_map(
                fn (int $index): string => $items[$index] ?? (string) ($fallbackList[$index] ?? ''),
                range(0, $fixedLength - 1),
            );
        }

        return $items;
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  array<string, mixed>  $section
     * @return list<string>
     */
    private function multiSelect(array $field, mixed $value, array $section): array
    {
        $allowed = is_array($section[$field['optionsFrom']] ?? null)
            ? array_map('strval', $section[$field['optionsFrom']])
            : null;
        $selected = is_array($value) ? array_map(fn (mixed $item): string => is_scalar($item) ? (string) $item : '', $value) : [];

        if ($allowed !== null) {
            $selected = array_filter($selected, fn (string $item): bool => in_array($item, $allowed, true));
        }

        return array_values(array_unique($selected));
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  array<string, mixed>  $section
     * @return list<array<string, mixed>>
     */
    private function list(array $field, mixed $value, mixed $fallback, array $section): array
    {
        $source = is_array($value) && array_is_list($value) ? $value : (is_array($fallback) && array_is_list($fallback) ? $fallback : []);
        $items = array_filter(array_slice($source, 0, self::MAX_ITEMS), fn (mixed $item): bool => $this->isObject($item));

        return array_values(array_map(
            fn (array $item): array => $this->sanitizeObject($field['fields'], $item, $field['newItem'] ?? [], $section),
            $items,
        ));
    }

    /**
     * Home page section order. Unknown keys are dropped; sections added later appear at the end.
     *
     * @return list<array{key: string, visible: bool}>
     */
    private function layoutSections(mixed $value): array
    {
        $known = $this->schema->layoutKeys();
        $seen = [];
        $output = [];

        foreach (is_array($value) ? $value : [] as $entry) {
            if (! $this->isObject($entry)) {
                continue;
            }
            $key = is_string($entry['key'] ?? null) ? $entry['key'] : '';
            if (! in_array($key, $known, true) || isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $output[] = ['key' => $key, 'visible' => ($entry['visible'] ?? true) !== false];
        }

        foreach ($known as $key) {
            if (! isset($seen[$key])) {
                $output[] = ['key' => $key, 'visible' => true];
            }
        }

        return $output;
    }

    /**
     * A JSON object decodes to an associative array (or an empty array for {}).
     */
    private function isObject(mixed $value): bool
    {
        return is_array($value) && ($value === [] || ! array_is_list($value));
    }
}
