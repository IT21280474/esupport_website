<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UploadedFileController extends Controller
{
    /**
     * Serve an uploaded image. Filenames are unique, so responses cache forever.
     */
    public function __invoke(string $filename): BinaryFileResponse
    {
        $disk = Storage::disk('public');
        abort_unless($disk->exists('uploads/'.$filename), Response::HTTP_NOT_FOUND);

        return response()->file($disk->path('uploads/'.$filename), [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
