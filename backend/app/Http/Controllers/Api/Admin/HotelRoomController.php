<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\AdminFormRequest;
use App\Http\Requests\Admin\HotelRoomRequest;
use App\Http\Resources\HotelRoomResource;
use App\Models\HotelRoom;
use Illuminate\Database\Eloquent\Model;

class HotelRoomController extends CrudController
{
    protected string $model = HotelRoom::class;

    protected string $resource = HotelRoomResource::class;

    protected string $request = HotelRoomRequest::class;

    protected array $with = ['image', 'amenities'];

    protected array $withDetail = ['gallery'];

    protected array $searchable = ['name', 'description', 'bed_type'];

    protected array $filters = ['status' => 'status', 'is_active' => 'is_active'];

    /** @param  HotelRoom  $model */
    protected function afterSave(Model $model, AdminFormRequest $request): void
    {
        if ($request->has('amenity_ids')) {
            $model->amenities()->sync($request->validated('amenity_ids') ?? []);
        }

        $model->syncGallery($request->has('gallery_ids') ? ($request->validated('gallery_ids') ?? []) : null);
    }
}
