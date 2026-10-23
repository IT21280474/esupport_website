<?php

namespace App\Models;

use App\Enums\CareerStatus;
use App\Enums\EmploymentType;
use App\Models\Concerns\HasSlug;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'title', 'slug', 'department', 'location', 'employment_type', 'summary', 'description',
    'responsibilities', 'requirements', 'closing_date', 'status', 'sort_order',
])]
class Career extends Model
{
    use HasSlug, IsCmsContent, SoftDeletes;

    protected function casts(): array
    {
        return [
            'closing_date' => 'date',
            'status' => CareerStatus::class,
            'employment_type' => EmploymentType::class,
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /** Published and not past its closing date — i.e. accepting applications. */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', CareerStatus::Published)
            ->where(fn (Builder $q) => $q->whereNull('closing_date')->orWhereDate('closing_date', '>=', today()));
    }

    public function isOpen(): bool
    {
        return $this->status === CareerStatus::Published
            && ($this->closing_date === null || $this->closing_date->endOfDay()->isFuture());
    }
}
