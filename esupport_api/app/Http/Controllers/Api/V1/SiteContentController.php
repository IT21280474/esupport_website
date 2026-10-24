<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\Content\ContentRepository;
use Illuminate\Http\JsonResponse;

class SiteContentController extends Controller
{
    /**
     * Public: the full website content (edited sections merged over defaults).
     */
    public function __invoke(ContentRepository $content): JsonResponse
    {
        return response()->json(['data' => $content->all()]);
    }
}
