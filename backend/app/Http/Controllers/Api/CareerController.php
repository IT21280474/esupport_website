<?php

namespace App\Http\Controllers\Api;

use App\Enums\CareerStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CareerResource;
use App\Models\Career;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CareerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CareerResource::collection(Career::open()->ordered()->get());
    }

    /** Closed jobs stay viewable (marked closed) so shared links don't break. */
    public function show(string $slug): CareerResource
    {
        return new CareerResource(
            Career::whereIn('status', [CareerStatus::Published, CareerStatus::Closed])
                ->where('slug', $slug)
                ->firstOrFail()
        );
    }
}
