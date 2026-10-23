<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class ProductRequest extends AdminFormRequest
{
    protected array $richText = ['description'];

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule('products'),
            // Deleted products don't block their part number (see Product::booted)
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($this->recordId())->whereNull('deleted_at')],
            'product_category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'vehicle_type_ids' => ['nullable', 'array'],
            'vehicle_type_ids.*' => ['integer', 'exists:vehicle_types,id'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:50000'],
            'image_id' => $this->mediaRule(),
            ...$this->galleryRules(),
            ...$this->flagRules(),
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
