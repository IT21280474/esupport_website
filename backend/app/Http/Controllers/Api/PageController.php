<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\PageService;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Page::where('is_published', true)->orderBy('id')->get(['slug', 'title'])
        );
    }

    public function show(string $slug, PageService $pages): JsonResponse
    {
        $payload = ContentCache::remember("page:{$slug}", function () use ($slug, $pages) {
            $page = Page::where('slug', $slug)->where('is_published', true)->first();

            return $page ? $pages->publicPayload($page) : null;
        });

        abort_if($payload === null, 404, 'Page not found.');

        return response()->json($payload);
    }
}
