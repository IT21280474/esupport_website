<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public frontend URL
    |--------------------------------------------------------------------------
    |
    | Base URL of the React website. Used for password-reset links, the
    | sitemap and canonical URLs.
    |
    */

    'frontend_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'),

    /*
    |--------------------------------------------------------------------------
    | Uploads
    |--------------------------------------------------------------------------
    */

    'uploads' => [
        // Media library (public disk)
        'image_max_kb' => 8192,
        'document_max_kb' => 10240,
        'image_mimes' => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'document_mimes' => ['pdf', 'doc', 'docx'],

        // CVs submitted through the careers form (private disk, never public)
        'cv_max_kb' => 5120,
        'cv_mimes' => ['pdf', 'doc', 'docx'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Generated image sizes (longest edge in px, WebP output)
    |--------------------------------------------------------------------------
    */

    'image_variants' => [
        'thumb' => 480,
        'medium' => 1200,
        'large' => 2000,
    ],

    'image_quality' => 82,

    /*
    |--------------------------------------------------------------------------
    | Public API cache (seconds). Content edits bump a version key, so cached
    | responses are invalidated immediately on change.
    |
    */

    'cache_ttl' => (int) env('CONTENT_CACHE_TTL', 3600),

    /*
    |--------------------------------------------------------------------------
    | First Super Admin (used only by AdminUserSeeder)
    |--------------------------------------------------------------------------
    */

    'admin' => [
        'name' => env('ADMIN_NAME', 'Site Administrator'),
        'email' => env('ADMIN_EMAIL', 'admin@example.com'),
        'password' => env('ADMIN_PASSWORD'),
    ],

];
