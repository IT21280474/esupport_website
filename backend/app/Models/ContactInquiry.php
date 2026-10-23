<?php

namespace App\Models;

use App\Enums\BusinessArea;
use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'type', 'business_area', 'name', 'email', 'phone', 'subject', 'message', 'meta',
    'status', 'notes', 'handled_by', 'ip_address', 'user_agent',
])]
class ContactInquiry extends Model
{
    use LogsActivity, SoftDeletes;

    protected function casts(): array
    {
        return [
            'type' => InquiryType::class,
            'business_area' => BusinessArea::class,
            'status' => InquiryStatus::class,
            'meta' => 'array',
        ];
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by')->withTrashed();
    }

    public function activityLabel(): string
    {
        return "inquiry from “{$this->name}”";
    }
}
