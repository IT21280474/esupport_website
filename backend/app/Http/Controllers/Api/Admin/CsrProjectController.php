<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\AdminFormRequest;
use App\Http\Requests\Admin\CsrProjectRequest;
use App\Http\Resources\CsrProjectResource;
use App\Models\CsrProject;
use Illuminate\Database\Eloquent\Model;

class CsrProjectController extends CrudController
{
    protected string $model = CsrProject::class;

    protected string $resource = CsrProjectResource::class;

    protected string $request = CsrProjectRequest::class;

    protected array $with = ['image', 'category'];

    protected array $withDetail = ['gallery'];

    protected array $searchable = ['title', 'excerpt', 'location'];

    protected array $sortable = ['sort_order', 'title', 'project_date', 'created_at', 'updated_at'];

    protected array $filters = ['category_id' => 'csr_category_id', 'is_active' => 'is_active', 'is_featured' => 'is_featured'];

    /** @param  CsrProject  $model */
    protected function afterSave(Model $model, AdminFormRequest $request): void
    {
        $model->syncGallery($request->has('gallery_ids') ? ($request->validated('gallery_ids') ?? []) : null);
    }
}
