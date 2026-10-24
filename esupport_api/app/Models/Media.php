<?php

namespace App\Models;

use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An uploaded image, stored as WebP on the "public" disk under uploads/.
 */
#[Fillable(['filename', 'original_name', 'mime', 'size', 'width', 'height', 'uploaded_by'])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Site-relative URL. The website proxies /uploads/* to this API.
     */
    public function url(): string
    {
        return '/uploads/'.$this->filename;
    }

    public function storagePath(): string
    {
        return 'uploads/'.$this->filename;
    }
}
