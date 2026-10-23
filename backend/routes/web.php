<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

/*
| The public website is the React app (frontend/). This Laravel app only
| serves the JSON API, uploaded media and the sitemap.
*/

Route::get('/', fn () => response()->json([
    'name' => config('app.name').' API',
    'website' => config('muthumala.frontend_url'),
]));

Route::get('sitemap.xml', SitemapController::class);
