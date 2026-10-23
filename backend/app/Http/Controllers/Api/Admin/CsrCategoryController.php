<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\TaxonomyRequest;
use App\Http\Resources\TaxonomyResource;
use App\Models\CsrCategory;

class CsrCategoryController extends CrudController
{
    protected string $model = CsrCategory::class;

    protected string $resource = TaxonomyResource::class;

    protected string $request = TaxonomyRequest::class;

    protected array $with = [];

    protected array $withCount = ['projects as items_count'];

    protected array $filters = ['is_active' => 'is_active'];

    protected array $toggleable = ['is_active'];
}
