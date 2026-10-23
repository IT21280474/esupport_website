<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Record an admin action. Silently skipped for anonymous requests
     * (public form submissions are not admin activity).
     *
     * @param  array<string, mixed>  $properties
     */
    public static function log(string $action, string $description, ?Model $subject = null, array $properties = [], ?int $userId = null): void
    {
        $userId ??= Auth::id();

        if ($userId === null) {
            return;
        }

        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'properties' => $properties ?: null,
            'ip_address' => Request::ip(),
        ]);
    }
}
