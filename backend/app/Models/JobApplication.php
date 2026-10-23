<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'career_id', 'position', 'name', 'email', 'phone', 'message', 'cv_path', 'cv_original_name',
    'cv_mime', 'cv_size', 'status', 'notes', 'ip_address', 'user_agent',
])]
#[Hidden(['cv_path'])]
class JobApplication extends Model
{
    use LogsActivity, SoftDeletes;

    /** CVs live on the private disk and are only streamed to authorised admins. */
    public const CV_DISK = 'local';

    protected function casts(): array
    {
        return [
            'status' => ApplicationStatus::class,
            'cv_size' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::forceDeleted(fn (JobApplication $application) => Storage::disk(self::CV_DISK)->delete($application->cv_path));
    }

    public function career(): BelongsTo
    {
        return $this->belongsTo(Career::class)->withTrashed();
    }

    public function activityLabel(): string
    {
        return "job application from “{$this->name}” ({$this->position})";
    }
}
