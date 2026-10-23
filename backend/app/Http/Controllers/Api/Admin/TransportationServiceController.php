<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\TransportationServiceRequest;
use App\Http\Resources\TransportationServiceResource;
use App\Models\TransportationService;

class TransportationServiceController extends CrudController
{
    protected string $model = TransportationService::class;

    protected string $resource = TransportationServiceResource::class;

    protected string $request = TransportationServiceRequest::class;

    protected array $with = ['image'];

    protected array $searchable = ['title', 'description'];

    protected array $sortable = ['sort_order', 'title', 'created_at', 'updated_at'];

    protected array $filters = ['is_active' => 'is_active'];
}
