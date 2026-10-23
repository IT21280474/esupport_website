<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\GalleryImageRequest;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GalleryImageController extends CrudController
{
    protected string $model = GalleryImage::class;

    protected string $resource = GalleryImageResource::class;

    protected string $request = GalleryImageRequest::class;

    protected array $with = ['media', 'album'];

    protected array $searchable = ['title', 'description'];

    protected array $sortable = ['sort_order', 'title', 'created_at', 'updated_at'];

    protected array $filters = ['album_id' => 'gallery_album_id', 'is_active' => 'is_active', 'is_featured' => 'is_featured'];

    /**
     * Add several media-library images to an album in one step
     * (used after a multi-file upload in the gallery manager).
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'gallery_album_id' => ['required', 'integer', 'exists:gallery_albums,id'],
            'media_ids' => ['required', 'array', 'min:1', 'max:100'],
            'media_ids.*' => ['integer', 'exists:media,id'],
        ]);

        $created = DB::transaction(function () use ($data) {
            $next = (int) GalleryImage::where('gallery_album_id', $data['gallery_album_id'])->max('sort_order') + 1;

            return Media::whereKey($data['media_ids'])->get()->map(fn (Media $media) => GalleryImage::create([
                'gallery_album_id' => $data['gallery_album_id'],
                'media_id' => $media->id,
                'title' => $media->title,
                'is_active' => true,
                'sort_order' => $next++,
            ]));
        });

        return response()->json([
            'message' => count($created).' image(s) added to the album.',
            'data' => GalleryImageResource::collection(collect($created)->each->load(['media', 'album']))->resolve(),
        ], 201);
    }
}
