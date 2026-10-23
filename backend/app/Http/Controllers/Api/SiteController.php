<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use App\Services\SettingsService;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;

/**
 * Global website data: company details, contact, WhatsApp desks, navigation,
 * SEO defaults and social links. Loaded once by the React app.
 */
class SiteController extends Controller
{
    public function __invoke(SettingsService $settings): JsonResponse
    {
        $payload = ContentCache::remember('site', fn () => [
            'settings' => $settings->publicPayload(),
            'social' => SocialLink::active()->ordered()->whereNotNull('url')->where('url', '!=', '')
                ->get(['platform', 'url'])->toArray(),
        ]);

        return response()->json($payload);
    }
}
