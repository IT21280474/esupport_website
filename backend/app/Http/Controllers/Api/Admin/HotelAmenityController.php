<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\HotelAmenityRequest;
use App\Http\Resources\HotelAmenityResource;
use App\Models\HotelAmenity;

class HotelAmenityController extends CrudController
{
    protected string $model = HotelAmenity::class;

    protected string $resource = HotelAmenityResource::class;

    protected string $request = HotelAmenityRequest::class;

    protected array $searchable = ['name', 'description'];

    protected array $filters = ['is_active' => 'is_active'];

    protected array $toggleable = ['is_active'];
}
