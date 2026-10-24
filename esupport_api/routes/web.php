<?php

use App\Http\Controllers\UploadedFileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['name' => config('app.name'), 'api' => url('/api/v1')]);
});

/* Admin-uploaded images; the website proxies /uploads/* here. */
Route::get('/uploads/{filename}', UploadedFileController::class)
    ->where('filename', '[a-z0-9][a-z0-9._-]*\.webp')
    ->name('uploads.show');
