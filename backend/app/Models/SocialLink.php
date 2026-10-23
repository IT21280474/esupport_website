<?php

namespace App\Models;

use App\Models\Concerns\IsCmsContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['platform', 'url', 'sort_order', 'is_active'])]
class SocialLink extends Model
{
    use IsCmsContent;

    public const PLATFORMS = ['facebook', 'instagram', 'youtube', 'linkedin', 'tiktok', 'whatsapp'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function activityLabel(): string
    {
        return "social link “{$this->platform}”";
    }
}
