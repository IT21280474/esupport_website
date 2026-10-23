<?php

namespace App\Http\Requests\Admin;

use App\Cms\Icons;
use Illuminate\Validation\Rule;

class HotelAmenityRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:190'],
            'icon' => ['nullable', 'string', Rule::in(Icons::ALL)],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
