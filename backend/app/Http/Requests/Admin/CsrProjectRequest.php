<?php

namespace App\Http\Requests\Admin;

class CsrProjectRequest extends AdminFormRequest
{
    protected array $richText = ['description'];

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule('csr_projects'),
            'csr_category_id' => ['nullable', 'integer', 'exists:csr_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:50000'],
            'project_date' => ['nullable', 'date'],
            'date_label' => ['nullable', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:190'],
            'image_id' => $this->mediaRule(),
            ...$this->galleryRules(),
            ...$this->flagRules(),
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
