<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActivityLogController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ActivityLogResource::collection(ActivityLog::query()->with('user:id,name')->latest('id')->limit(300)->get());
    }
}
