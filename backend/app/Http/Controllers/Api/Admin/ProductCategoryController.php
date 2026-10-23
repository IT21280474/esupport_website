<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\TaxonomyRequest;
use App\Http\Resources\TaxonomyResource;
use App\Models\ProductCategory;

class ProductCategoryController extends CrudController
{
    protected string $model = ProductCategory::class;

    protected string $resource = TaxonomyResource::class;

    protected string $request = TaxonomyRequest::class;

    protected array $with = ['image'];

    protected array $withCount = ['products as items_count'];

    protected array $filters = ['is_active' => 'is_active'];

    protected array $toggleable = ['is_active'];
}
