<?php

namespace App\Models;

use Database\Factories\ActivityLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Audit trail of admin actions ("who changed what").
 */
#[Fillable(['user_id', 'action', 'detail'])]
class ActivityLog extends Model
{
    /** @use HasFactory<ActivityLogFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(?User $user, string $action, ?string $detail = null): self
    {
        return self::create([
            'user_id' => $user?->id,
            'action' => $action,
            'detail' => $detail,
        ]);
    }
}
