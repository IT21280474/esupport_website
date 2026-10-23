<?php

namespace App\Http\Requests\Admin;

use App\Cms\Icons;
use Illuminate\Validation\Rule;

class TransportationServiceRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule('transportation_services'),
            'icon' => ['nullable', 'string', Rule::in(Icons::ALL)],
            'description' => ['nullable', 'string', 'max:2000'],
            'image_id' => $this->mediaRule(),
            ...$this->flagRules(),
        ];
    }
}
