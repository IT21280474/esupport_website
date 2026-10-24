<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\LeadResource;
use App\Models\ActivityLog;
use App\Models\ContentSection;
use App\Models\Lead;
use App\Models\Media;
use App\Models\User;
use App\Support\Content\ContentSchema;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(ContentSchema $schema): JsonResponse
    {
        $edited = ContentSection::query()->with('editor:id,name')->get()
            ->mapWithKeys(fn (ContentSection $section): array => [$section->key => [
                'updated_at' => $section->updated_at?->toIso8601String(),
                'updated_by' => $section->editor?->name,
            ]]);

        return response()->json([
            'stats' => [
                'unread_leads' => Lead::query()->whereNull('read_at')->count(),
                'edited_sections' => $edited->count(),
                'total_sections' => count($schema->keys()),
                'media' => Media::query()->count(),
                'active_users' => User::query()->where('is_active', true)->count(),
            ],
            'edited' => (object) $edited->all(),
            'activity' => ActivityLogResource::collection(ActivityLog::query()->with('user:id,name')->latest('id')->limit(8)->get()),
            'leads' => LeadResource::collection(Lead::query()->latest('id')->limit(5)->get()),
        ]);
    }
}
