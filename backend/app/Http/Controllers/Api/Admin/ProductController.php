<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\AdminFormRequest;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ProductController extends CrudController
{
    protected string $model = Product::class;

    protected string $resource = ProductResource::class;

    protected string $request = ProductRequest::class;

    protected array $with = ['category', 'brand', 'image', 'vehicleTypes'];

    protected array $withDetail = ['gallery'];

    protected array $searchable = ['name', 'sku', 'short_description'];

    protected array $filters = [
        'category_id' => 'product_category_id',
        'brand_id' => 'brand_id',
        'is_active' => 'is_active',
        'is_featured' => 'is_featured',
    ];

    protected function scopeIndex(Builder $query, Request $request): void
    {
        $query->when($request->integer('vehicle_type_id'), fn ($q, $id) => $q->whereRelation('vehicleTypes', 'vehicle_types.id', $id));
    }

    /** @param  Product  $model */
    protected function afterSave(Model $model, AdminFormRequest $request): void
    {
        if ($request->has('vehicle_type_ids')) {
            $model->vehicleTypes()->sync($request->validated('vehicle_type_ids') ?? []);
        }

        $model->syncGallery($request->has('gallery_ids') ? ($request->validated('gallery_ids') ?? []) : null);
    }
}
