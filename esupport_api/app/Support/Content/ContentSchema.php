<?php

namespace App\Support\Content;

use RuntimeException;

/**
 * Loads the content model (field schema + default content) from resources/content.
 *
 * The same JSON drives the admin forms (served via the API) and server-side validation.
 */
class ContentSchema
{
    /** @var array{layoutKeys: list<string>, sections: list<array<string, mixed>>}|null */
    private ?array $schema = null;

    /** @var array<string, array<string, mixed>>|null */
    private ?array $defaults = null;

    /**
     * @return list<array{key: string, title: string, group: string, description: string, fields: list<array<string, mixed>>}>
     */
    public function sections(): array
    {
        return $this->schema()['sections'];
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        return array_column($this->sections(), 'key');
    }

    public function has(string $key): bool
    {
        return in_array($key, $this->keys(), true);
    }

    /**
     * @return array{key: string, title: string, group: string, description: string, fields: list<array<string, mixed>>}
     */
    public function section(string $key): array
    {
        foreach ($this->sections() as $section) {
            if ($section['key'] === $key) {
                return $section;
            }
        }

        throw new RuntimeException("Unknown content section [{$key}].");
    }

    /**
     * @return list<string>
     */
    public function layoutKeys(): array
    {
        return $this->schema()['layoutKeys'];
    }

    /**
     * @return array<string, mixed>
     */
    public function defaults(string $key): array
    {
        return $this->allDefaults()[$key] ?? [];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function allDefaults(): array
    {
        return $this->defaults ??= $this->readJson('defaults.json');
    }

    /**
     * @return array{layoutKeys: list<string>, sections: list<array<string, mixed>>}
     */
    private function schema(): array
    {
        return $this->schema ??= $this->readJson('schema.json');
    }

    /**
     * @return array<string, mixed>
     */
    private function readJson(string $file): array
    {
        return json_decode((string) file_get_contents(resource_path('content/'.$file)), true, flags: JSON_THROW_ON_ERROR);
    }
}
