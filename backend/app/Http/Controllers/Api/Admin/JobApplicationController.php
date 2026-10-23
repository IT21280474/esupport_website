<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class JobApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(ApplicationStatus::class)],
            'career_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        return JobApplicationResource::collection(
            JobApplication::with('career:id,title')
                ->when($request->input('status'), fn ($q, $v) => $q->where('status', $v))
                ->when($request->integer('career_id'), fn ($q, $v) => $q->where('career_id', $v))
                ->when($request->string('search')->toString(), function ($q, $term) {
                    $like = '%'.addcslashes($term, '%_\\').'%';
                    $q->where(fn ($w) => $w->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('position', 'like', $like));
                })
                ->latest()->latest('id')
                ->paginate($request->integer('per_page', 25))
        );
    }

    public function show(JobApplication $application): JobApplicationResource
    {
        return new JobApplicationResource($application->load('career:id,title'));
    }

    public function update(Request $request, JobApplication $application): JobApplicationResource
    {
        $application->update($request->validate([
            'status' => ['required', Rule::enum(ApplicationStatus::class)],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]));

        return new JobApplicationResource($application->load('career:id,title'));
    }

    /** Permanently removes the application and its CV file (personal data). */
    public function destroy(JobApplication $application): JsonResponse
    {
        $application->forceDelete();

        return response()->json(['message' => 'Application and CV deleted.']);
    }

    /** Streams the CV from the private disk — there is no public URL for CVs. */
    public function downloadCv(JobApplication $application): StreamedResponse
    {
        $disk = Storage::disk(JobApplication::CV_DISK);
        abort_unless($disk->exists($application->cv_path), 404, 'CV file not found.');

        ActivityLogger::log('downloaded', "Downloaded CV of “{$application->name}”", $application);

        $extension = pathinfo($application->cv_path, PATHINFO_EXTENSION);
        $filename = Str::slug($application->name.' '.$application->position).'-cv.'.$extension;

        return $disk->download($application->cv_path, $filename, [
            'Content-Type' => $application->cv_mime,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
