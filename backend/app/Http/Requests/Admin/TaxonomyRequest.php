<?php

namespace App\Http\Requests\Admin;

use App\Cms\Icons;
use Illuminate\Validation\Rule;

/**
 * Shared by the simple lookup modules: product categories, vehicle types,
 * brands, CSR categories and gallery albums. The module is identified by the
 * URL segment (/api/admin/{module}), and only that table's columns are accepted.
 */
class TaxonomyRequest extends AdminFormRequest
{
    /** route name prefix => [table, extra media column or null, has icon] */
    private const TABLES = [
        'product-categories' => ['product_categories', 'image_id', true],
        'vehicle-types' => ['vehicle_types', 'image_id', false],
        'brands' => ['brands', 'logo_id', false],
        'csr-categories' => ['csr_categories', null, true],
        'gallery-albums' => ['gallery_albums', 'cover_id', false],
    ];

    public function rules(): array
    {
        [$table, $mediaColumn, $hasIcon] = self::TABLES[$this->segment(3)];

        $rules = [
            'name' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule($table),
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];

        if ($mediaColumn) {
            $rules[$mediaColumn] = $this->mediaRule();
        }

        if ($hasIcon) {
            $rules['icon'] = ['nullable', 'string', Rule::in(Icons::ALL)];
        }

        return $rules;
    }
}
