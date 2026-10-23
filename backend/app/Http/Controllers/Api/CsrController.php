<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CsrProjectResource;
use App\Http\Resources\TaxonomyResource;
use App\Models\CsrCategory;
use App\Models\CsrProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CsrController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $category = $request->string('category')->toString();

        return response()->json([
            'categories' => TaxonomyResource::collection(CsrCategory::active()->ordered()->get())->resolve(),
            'projects' => CsrProjectResource::collection(
                CsrProject::active()->ordered()
                    ->when($category, fn ($q) => $q->whereRelation('category', 'slug', $category))
                    ->with(['image', 'category'])
                    ->get()
            )->resolve(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $project = CsrProject::active()->where('slug', $slug)
            ->with(['image', 'category', 'gallery'])
            ->firstOrFail();

        $related = CsrProject::active()->whereKeyNot($project->id)->ordered()
            ->with(['image', 'category'])->limit(3)->get();

        return response()->json([
            'project' => (new CsrProjectResource($project))->resolve(),
            'related' => CsrProjectResource::collection($related)->resolve(),
        ]);
    }
}
