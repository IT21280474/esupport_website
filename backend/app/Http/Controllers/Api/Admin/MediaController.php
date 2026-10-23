<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\MediaService;
use App\Services\MediaUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\ValidationException;

class MediaController extends Controller
{
    public function __construct(private MediaService $media) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in([Media::TYPE_IMAGE, Media::TYPE_DOCUMENT])],
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer'],
        ]);

        $items = Media::with('uploader:id,name')
            ->when($request->input('ids'), fn ($q, $ids) => $q->whereKey($ids))
            ->when($request->input('type'), fn ($q, $type) => $q->where('type', $type))
            ->when($request->string('search')->toString(), function ($q, $term) {
                $like = '%'.addcslashes($term, '%_\\').'%';
                $q->where(fn ($w) => $w->where('original_name', 'like', $like)
                    ->orWhere('title', 'like', $like)
                    ->orWhere('alt', 'like', $like));
            })
            ->latest()
            ->latest('id')
            ->paginate($request->integer('per_page', 24));

        return MediaResource::collection($items);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', $this->fileRule()],
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('file');
        $this->assertImageSize($file);

        $media = $this->media->store($file, $request->only('alt', 'title', 'caption'));

        return (new MediaResource($media->load('uploader')))->response()->setStatusCode(201);
    }

    public function show(Media $media, MediaUsage $usage): JsonResponse
    {
        return response()->json([
            'data' => (new MediaResource($media->load('uploader')))->resolve(),
            'usage' => $usage->for($media),
        ]);
    }

    public function update(Request $request, Media $media): MediaResource
    {
        $media->update($request->validate([
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
        ]));

        return new MediaResource($media->load('uploader'));
    }

    /** Upload a new file in place of an existing one (all references keep working). */
    public function replace(Request $request, Media $media): MediaResource
    {
        $request->validate(['file' => ['required', $this->fileRule()]]);
        $file = $request->file('file');
        $this->assertImageSize($file);

        $isImage = str_starts_with((string) $file->getMimeType(), 'image/');
        if ($isImage !== $media->isImage()) {
            throw ValidationException::withMessages(['file' => 'Replace an image with an image, or a document with a document.']);
        }

        return new MediaResource($this->media->replace($media, $file)->load('uploader'));
    }

    public function destroy(Media $media): JsonResponse
    {
        $media->delete();

        return response()->json(['message' => 'File deleted.']);
    }

    private function fileRule(): File
    {
        $types = [...config('muthumala.uploads.image_mimes'), ...config('muthumala.uploads.document_mimes')];

        return File::types($types)->max(max(config('muthumala.uploads.image_max_kb'), config('muthumala.uploads.document_max_kb')));
    }

    private function assertImageSize(UploadedFile $file): void
    {
        $limitKb = config('muthumala.uploads.image_max_kb');

        if (str_starts_with((string) $file->getMimeType(), 'image/') && $file->getSize() > $limitKb * 1024) {
            throw ValidationException::withMessages(['file' => 'Images must be smaller than '.($limitKb / 1024).' MB.']);
        }
    }
}
