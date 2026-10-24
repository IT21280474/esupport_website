<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\ActivityLog;
use App\Models\Media;
use App\Support\Media\ImageStore;
use App\Support\Media\MediaException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;

class MediaController extends Controller
{
    public function __construct(private ImageStore $images) {}

    public function index(): AnonymousResourceCollection
    {
        return MediaResource::collection(Media::query()->with('uploader:id,name')->latest('id')->limit(500)->get());
    }

    /**
     * Upload one or more images; each is converted to WebP.
     */
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $stored = [];

        /** @var UploadedFile $file */
        foreach ($request->file('files') as $file) {
            try {
                $stored[] = $this->images->store($file->get(), $file->getClientOriginalName(), $request->user());
            } catch (MediaException $exception) {
                return response()->json(['message' => $file->getClientOriginalName().': '.$exception->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        ActivityLog::record($request->user(), 'media.upload', collect($stored)->pluck('original_name')->implode(', '));

        return MediaResource::collection($stored)->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function destroy(Request $request, Media $media): Response
    {
        $this->images->delete($media);
        ActivityLog::record($request->user(), 'media.delete', $media->original_name);

        return response()->noContent();
    }
}
