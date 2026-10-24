<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateContentSectionRequest;
use App\Http\Resources\ApprovalResource;
use App\Http\Resources\RevisionResource;
use App\Models\ActivityLog;
use App\Models\ContentRevision;
use App\Models\ContentSection;
use App\Support\Content\ContentRepository;
use App\Support\Content\ContentSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ContentSectionController extends Controller
{
    public function __construct(
        private ContentSchema $schema,
        private ContentRepository $content,
    ) {}

    /**
     * Section, live content, the user's own unpublished draft and published history for the editor.
     */
    public function show(Request $request, string $key): JsonResponse
    {
        abort_unless($this->schema->has($key), Response::HTTP_NOT_FOUND);

        $draft = $this->content->draftFor($key, $request->user());

        return response()->json([
            'definition' => $this->schema->section($key),
            'data' => $this->content->get($key),
            'meta' => $this->meta($key),
            'draft' => $draft === null ? null : [...(new ApprovalResource($draft))->resolve($request), 'data' => $draft->data],
            'pending_count' => ContentRevision::query()->pending()->where('section_key', $key)->count(),
            'revisions' => RevisionResource::collection(
                ContentRevision::query()->published()->with('user:id,name')->where('section_key', $key)->limit(50)->get()
            ),
        ]);
    }

    /**
     * Admins publish straight away; editors' changes are held for an admin to approve.
     */
    public function update(UpdateContentSectionRequest $request, string $key): JsonResponse
    {
        abort_unless($this->schema->has($key), Response::HTTP_NOT_FOUND);
        $title = $this->schema->section($key)['title'];

        if (Gate::denies('approve-content')) {
            $draft = $this->content->submit($key, $request->input('data'), $request->user());
            ActivityLog::record($request->user(), 'content.submit', $title);

            return response()->json(['data' => $draft->data, 'published' => false, 'meta' => $this->meta($key)], Response::HTTP_ACCEPTED);
        }

        $clean = $this->content->save($key, $request->input('data'), $request->user());
        ActivityLog::record($request->user(), 'content.save', $title);

        return response()->json(['data' => $clean, 'published' => true, 'meta' => $this->meta($key)]);
    }

    /**
     * Reset a section to the bundled defaults (history is kept).
     */
    public function destroy(Request $request, string $key): Response
    {
        abort_unless($this->schema->has($key), Response::HTTP_NOT_FOUND);
        Gate::authorize('reset-content');

        $this->content->reset($key);
        ActivityLog::record($request->user(), 'content.reset', $this->schema->section($key)['title']);

        return response()->noContent();
    }

    /**
     * Discard the user's own pending or rejected version, going back to the live content.
     */
    public function destroyDraft(Request $request, string $key): Response
    {
        abort_unless($this->schema->has($key), Response::HTTP_NOT_FOUND);

        $this->content->draftFor($key, $request->user())?->delete();

        return response()->noContent();
    }

    /**
     * @return array{updated_at: string|null, updated_by: string|null}|null
     */
    private function meta(string $key): ?array
    {
        $section = ContentSection::query()->with('editor:id,name')->where('key', $key)->first();

        return $section === null ? null : [
            'updated_at' => $section->updated_at?->toIso8601String(),
            'updated_by' => $section->editor?->name,
        ];
    }
}
