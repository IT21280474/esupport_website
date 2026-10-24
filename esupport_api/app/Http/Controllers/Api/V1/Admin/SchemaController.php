<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\Content\ContentSchema;
use Illuminate\Http\JsonResponse;

class SchemaController extends Controller
{
    /**
     * Field definitions for every section; the admin panel builds its forms from these.
     */
    public function __invoke(ContentSchema $schema): JsonResponse
    {
        return response()->json(['data' => [
            'layoutKeys' => $schema->layoutKeys(),
            'sections' => $schema->sections(),
        ]]);
    }
}
