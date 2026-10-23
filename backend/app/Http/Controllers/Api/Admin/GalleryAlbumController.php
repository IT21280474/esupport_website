<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\TaxonomyRequest;
use App\Http\Resources\TaxonomyResource;
use App\Models\GalleryAlbum;

class GalleryAlbumController extends CrudController
{
    protected string $model = GalleryAlbum::class;

    protected string $resource = TaxonomyResource::class;

    protected string $request = TaxonomyRequest::class;

    protected array $with = ['cover'];

    protected array $withCount = ['images as items_count'];

    protected array $filters = ['is_active' => 'is_active'];

    protected array $toggleable = ['is_active'];
}
