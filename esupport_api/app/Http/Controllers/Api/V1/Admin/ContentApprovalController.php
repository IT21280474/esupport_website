<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectRevisionRequest;
use App\Http\Resources\ApprovalResource;
use App\Models\ActivityLog;
use App\Models\ContentRevision;
use App\Support\Content\ContentRepository;
use App\Support\Content\ContentSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Admin review of editors' pending content changes.
 */
class ContentApprovalController extends Controller
{
    public function __construct(
        private ContentSchema $schema,
        private ContentRepository $content,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ApprovalResource::collection(
            ContentRevision::query()->pending()->with('user:id,name')->oldest('updated_at')->get()
        );
    }

    /**
     * The pending version next to what is live now, for comparison.
     */
    public function show(ContentRevision $revision): JsonResponse
    {
        abort_unless($this->schema->has($revision->section_key), Response::HTTP_NOT_FOUND);
        $revision->load(['user:id,name', 'reviewer:id,name']);

        return response()->json([
            'revision' => new ApprovalResource($revision),
            'definition' => $this->schema->section($revision->section_key),
            'live' => $this->content->get($revision->section_key),
            'proposed' => $revision->data,
            'stale' => $revision->isPending() && $this->content->isStale($revision),
        ]);
    }

    public function approve(Request $request, ContentRevision $revision): JsonResponse
    {
        $this->ensureReviewable($revision);

        $clean = $this->content->approve($revision, $request->user());
        ActivityLog::record($request->user(), 'content.approve', $this->describe($revision));

        return response()->json(['data' => $clean]);
    }

    public function reject(RejectRevisionRequest $request, ContentRevision $revision): Response
    {
        $this->ensureReviewable($revision);

        $this->content->reject($revision, $request->user(), $request->validated('note'));
        ActivityLog::record($request->user(), 'content.reject', $this->describe($revision));

        return response()->noContent();
    }

    private function ensureReviewable(ContentRevision $revision): void
    {
        abort_unless($this->schema->has($revision->section_key), Response::HTTP_NOT_FOUND);
        abort_unless($revision->isPending(), Response::HTTP_CONFLICT, 'This change has already been reviewed.');
    }

    private function describe(ContentRevision $revision): string
    {
        $title = $this->schema->section($revision->section_key)['title'];

        return $revision->user ? "{$title} by {$revision->user->name}" : $title;
    }
}
