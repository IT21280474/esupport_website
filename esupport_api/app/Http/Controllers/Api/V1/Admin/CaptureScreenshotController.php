<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CaptureScreenshotRequest;
use App\Http\Resources\MediaResource;
use App\Models\ActivityLog;
use App\Support\Media\MediaException;
use App\Support\Media\ScreenshotCapturer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CaptureScreenshotController extends Controller
{
    /**
     * Screenshot a live website and add it to the media library.
     */
    public function __invoke(CaptureScreenshotRequest $request, ScreenshotCapturer $capturer): JsonResponse
    {
        $url = $request->string('url')->toString();

        try {
            $media = $capturer->capture($url, $request->user());
        } catch (MediaException $exception) {
            return response()->json(['message' => $exception->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        ActivityLog::record($request->user(), 'media.capture', $url);

        return (new MediaResource($media))->response()->setStatusCode(Response::HTTP_CREATED);
    }
}
