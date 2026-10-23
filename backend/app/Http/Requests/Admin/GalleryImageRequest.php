<?php

namespace App\Http\Requests\Admin;

class GalleryImageRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'gallery_album_id' => ['required', 'integer', 'exists:gallery_albums,id'],
            'media_id' => ['required', 'integer', 'exists:media,id'],
            'title' => ['nullable', 'string', 'max:190'],
            'description' => ['nullable', 'string', 'max:500'],
            ...$this->flagRules(),
        ];
    }
}
