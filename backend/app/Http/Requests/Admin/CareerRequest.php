<?php

namespace App\Http\Requests\Admin;

use App\Enums\CareerStatus;
use App\Enums\EmploymentType;
use Illuminate\Validation\Rule;

class CareerRequest extends AdminFormRequest
{
    protected array $richText = ['description', 'responsibilities', 'requirements'];

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:190'],
            'slug' => $this->slugRule('careers'),
            'department' => ['nullable', 'string', 'max:190'],
            'location' => ['nullable', 'string', 'max:190'],
            'employment_type' => ['required', Rule::enum(EmploymentType::class)],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:50000'],
            'responsibilities' => ['nullable', 'string', 'max:50000'],
            'requirements' => ['nullable', 'string', 'max:50000'],
            'closing_date' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(CareerStatus::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
