<?php

namespace App\Models;

use App\RevisionStatus;
use Database\Factories\ContentRevisionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A saved snapshot of a section, used for history and restore. Editors' snapshots
 * start as pending and only reach the live site once an admin approves them.
 */
#[Fillable(['section_key', 'data', 'status', 'user_id', 'base_updated_at', 'reviewed_by', 'reviewed_at', 'review_note'])]
class ContentRevision extends Model
{
    /** @use HasFactory<ContentRevisionFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
            'status' => RevisionStatus::class,
            'base_updated_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Versions that have been live, newest first (approved editor changes sort by approval time).
     *
     * @param  Builder<ContentRevision>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', RevisionStatus::Approved)->latest('updated_at')->latest('id');
    }

    #[Scope]
    protected function pending(Builder $query): void
    {
        $query->where('status', RevisionStatus::Pending);
    }

    public function isPending(): bool
    {
        return $this->status === RevisionStatus::Pending;
    }
}
