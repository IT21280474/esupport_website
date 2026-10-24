<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ContentRevision;
use App\RevisionStatus;
use App\Support\Content\ContentRepository;
use App\Support\Content\ContentSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class RestoreRevisionController extends Controller
{
    /**
     * Republish an earlier version of a section (saved as a new revision).
     * For editors the restored version goes to an admin for approval instead.
     */
    public function __invoke(Request $request, ContentSchema $schema, ContentRepository $content, string $key, ContentRevision $revision): JsonResponse
    {
        abort_unless(
            $schema->has($key) && $revision->section_key === $key && $revision->status === RevisionStatus::Approved,
            Response::HTTP_NOT_FOUND
        );
        $detail = $schema->section($key)['title']." → revision #{$revision->id}";

        if (Gate::denies('approve-content')) {
            $draft = $content->submit($key, $revision->data, $request->user());
            ActivityLog::record($request->user(), 'content.submit', $detail);

            return response()->json(['data' => $draft->data, 'published' => false], Response::HTTP_ACCEPTED);
        }

        $clean = $content->save($key, $revision->data, $request->user());
        ActivityLog::record($request->user(), 'content.restore', $detail);

        return response()->json(['data' => $clean, 'published' => true]);
    }
}
