<?php

namespace App\Models;

use App\Cms\SectionRegistry;
use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['page_id', 'type', 'name', 'anchor', 'content', 'sort_order', 'is_enabled'])]
class PageSection extends Model
{
    use IsCmsContent;

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_enabled' => 'boolean',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function activityLabel(): string
    {
        $label = $this->name ?: (SectionRegistry::get($this->type)['label'] ?? $this->type);
        $page = $this->page?->title;

        return "section “{$label}”".($page ? " on {$page}" : '');
    }
}
