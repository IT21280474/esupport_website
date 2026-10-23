<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\AdminFormRequest;
use App\Http\Requests\Admin\FleetItemRequest;
use App\Http\Resources\FleetItemResource;
use App\Models\FleetItem;
use Illuminate\Database\Eloquent\Model;

class FleetItemController extends CrudController
{
    protected string $model = FleetItem::class;

    protected string $resource = FleetItemResource::class;

    protected string $request = FleetItemRequest::class;

    protected array $with = ['image', 'vehicleType'];

    protected array $withDetail = ['gallery'];

    protected array $searchable = ['name', 'description', 'capacity'];

    protected array $filters = ['vehicle_type_id' => 'vehicle_type_id', 'is_active' => 'is_active'];

    /** @param  FleetItem  $model */
    protected function afterSave(Model $model, AdminFormRequest $request): void
    {
        $model->syncGallery($request->has('gallery_ids') ? ($request->validated('gallery_ids') ?? []) : null);
    }
}
