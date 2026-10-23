<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Base for admin create/update requests. Permission checks happen on the
 * route group (can:<permission>), so authorize() only needs to pass through.
 */
abstract class AdminFormRequest extends FormRequest
{
    /** Validated keys that are synced as relations, not filled as attributes. */
    protected array $relationKeys = ['gallery_ids', 'vehicle_type_ids', 'amenity_ids'];

    /** Validated keys holding editor HTML, sanitised before saving. */
    protected array $richText = [];

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function modelAttributes(): array
    {
        $attributes = $this->safe()->except($this->relationKeys);

        foreach ($this->richText as $key) {
            if (array_key_exists($key, $attributes)) {
                $attributes[$key] = HtmlSanitizer::clean($attributes[$key]) ?: null;
            }
        }

        return $attributes;
    }

    protected function recordId(): ?int
    {
        $id = $this->route('id');

        return $id === null ? null : (int) $id;
    }

    protected function slugRule(string $table): array
    {
        return ['nullable', 'string', 'max:190', 'alpha_dash:ascii', Rule::unique($table, 'slug')->ignore($this->recordId())];
    }

    protected function mediaRule(): array
    {
        return ['nullable', 'integer', 'exists:media,id'];
    }

    /** @return array<string, array<int, mixed>> */
    protected function galleryRules(): array
    {
        return [
            'gallery_ids' => ['nullable', 'array', 'max:50'],
            'gallery_ids.*' => ['integer', 'exists:media,id'],
        ];
    }

    /** @return array<string, array<int, string>> */
    protected function flagRules(): array
    {
        return [
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
