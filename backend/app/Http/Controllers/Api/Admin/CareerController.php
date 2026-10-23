<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\CareerRequest;
use App\Http\Resources\CareerResource;
use App\Models\Career;

class CareerController extends CrudController
{
    protected string $model = Career::class;

    protected string $resource = CareerResource::class;

    protected string $request = CareerRequest::class;

    protected array $withCount = ['applications'];

    protected array $searchable = ['title', 'department', 'location'];

    protected array $sortable = ['sort_order', 'title', 'closing_date', 'created_at', 'updated_at'];

    protected array $filters = ['status' => 'status', 'employment_type' => 'employment_type'];

    protected array $toggleable = [];
}
