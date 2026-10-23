<?php

namespace App\Models\Concerns;

use App\Services\ActivityLogger;
use Illuminate\Support\Str;

/**
 * Writes created / updated / deleted events for admin users to activity_logs.
 */
trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(fn ($model) => ActivityLogger::log('created', 'Created '.$model->activityLabel(), $model));

        static::updated(function ($model) {
            $changed = array_keys(array_diff_key($model->getChanges(), array_flip(['updated_at'])));
            if ($changed) {
                ActivityLogger::log('updated', 'Updated '.$model->activityLabel(), $model, ['fields' => $changed]);
            }
        });

        static::deleted(fn ($model) => ActivityLogger::log('deleted', 'Deleted '.$model->activityLabel(), $model));
    }

    public function activityLabel(): string
    {
        $type = Str::lower(Str::headline(class_basename($this)));
        $name = $this->getAttribute('name') ?? $this->getAttribute('title') ?? '#'.$this->getKey();

        return "{$type} “{$name}”";
    }
}
