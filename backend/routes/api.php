<?php

use App\Http\Controllers\Api;
use App\Http\Controllers\Api\Admin;
use App\Http\Middleware\EnsureActiveAdmin;
use App\Http\Middleware\Honeypot;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public website API
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:api')->group(function () {
    Route::get('site', Api\SiteController::class);
    Route::get('pages', [Api\PageController::class, 'index']);
    Route::get('pages/{slug}', [Api\PageController::class, 'show']);

    Route::get('products', [Api\ProductController::class, 'index']);
    Route::get('products/filters', [Api\CatalogueController::class, 'productFilters']);
    Route::get('products/{slug}', [Api\ProductController::class, 'show']);

    Route::get('transportation', [Api\CatalogueController::class, 'transportation']);
    Route::get('hotel', [Api\CatalogueController::class, 'hotel']);
    Route::get('gallery', [Api\CatalogueController::class, 'gallery']);

    Route::get('csr', [Api\CsrController::class, 'index']);
    Route::get('csr/{slug}', [Api\CsrController::class, 'show']);

    Route::get('careers', [Api\CareerController::class, 'index']);
    Route::get('careers/{slug}', [Api\CareerController::class, 'show']);
});

// Form submissions: strict rate limit + honeypot
Route::middleware(['throttle:forms', Honeypot::class])->group(function () {
    Route::post('contact', [Api\InquiryController::class, 'contact']);
    Route::post('transport-requests', [Api\InquiryController::class, 'transport']);
    Route::post('hotel-reservations', [Api\InquiryController::class, 'hotel']);
    Route::post('part-requests', [Api\InquiryController::class, 'part']);
    Route::post('careers/apply', [Api\InquiryController::class, 'apply']);
});

/*
|--------------------------------------------------------------------------
| Admin API (Sanctum SPA session)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    Route::middleware('throttle:login')->group(function () {
        Route::post('login', [Admin\AuthController::class, 'login']);
        Route::post('forgot-password', [Admin\AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [Admin\AuthController::class, 'resetPassword']);
    });

    Route::middleware(['auth:sanctum', EnsureActiveAdmin::class, 'throttle:admin'])->group(function () {
        Route::post('logout', [Admin\AuthController::class, 'logout']);
        Route::get('me', [Admin\AuthController::class, 'me']);
        Route::put('me', [Admin\AuthController::class, 'updateProfile']);
        Route::get('dashboard', Admin\DashboardController::class);
        Route::get('meta', Admin\MetaController::class);

        Route::middleware('can:manage_media')->group(function () {
            Route::get('media', [Admin\MediaController::class, 'index']);
            Route::post('media', [Admin\MediaController::class, 'store']);
            Route::get('media/{media}', [Admin\MediaController::class, 'show']);
            Route::put('media/{media}', [Admin\MediaController::class, 'update']);
            Route::post('media/{media}/replace', [Admin\MediaController::class, 'replace']);
            Route::delete('media/{media}', [Admin\MediaController::class, 'destroy']);
        });

        Route::middleware('can:manage_pages')->group(function () {
            Route::get('section-types', [Admin\PageController::class, 'sectionTypes']);
            Route::get('pages', [Admin\PageController::class, 'index']);
            Route::get('pages/{page}', [Admin\PageController::class, 'show']);
            Route::put('pages/{page}', [Admin\PageController::class, 'update']);
            Route::post('pages/{page}/sections', [Admin\PageSectionController::class, 'store']);
            Route::post('pages/{page}/sections/reorder', [Admin\PageSectionController::class, 'reorder']);
            Route::put('sections/{section}', [Admin\PageSectionController::class, 'update']);
            Route::patch('sections/{section}/toggle', [Admin\PageSectionController::class, 'toggle']);
            Route::post('sections/{section}/duplicate', [Admin\PageSectionController::class, 'duplicate']);
            Route::delete('sections/{section}', [Admin\PageSectionController::class, 'destroy']);
        });

        $crud = function (string $uri, string $controller) {
            Route::post("{$uri}/reorder", [$controller, 'reorder']);
            Route::patch("{$uri}/{id}/toggle", [$controller, 'toggle'])->whereNumber('id');
            Route::get($uri, [$controller, 'index']);
            Route::post($uri, [$controller, 'store']);
            Route::get("{$uri}/{id}", [$controller, 'show'])->whereNumber('id');
            Route::put("{$uri}/{id}", [$controller, 'update'])->whereNumber('id');
            Route::delete("{$uri}/{id}", [$controller, 'destroy'])->whereNumber('id');
        };

        Route::middleware('can:manage_products')->group(function () use ($crud) {
            $crud('products', Admin\ProductController::class);
            $crud('product-categories', Admin\ProductCategoryController::class);
            $crud('vehicle-types', Admin\VehicleTypeController::class);
            $crud('brands', Admin\BrandController::class);
        });

        Route::middleware('can:manage_transportation')->group(function () use ($crud) {
            $crud('transportation-services', Admin\TransportationServiceController::class);
            $crud('fleet-items', Admin\FleetItemController::class);
        });

        Route::middleware('can:manage_hotel')->group(function () use ($crud) {
            $crud('hotel-rooms', Admin\HotelRoomController::class);
            $crud('hotel-amenities', Admin\HotelAmenityController::class);
        });

        Route::middleware('can:manage_gallery')->group(function () use ($crud) {
            $crud('gallery-albums', Admin\GalleryAlbumController::class);
            $crud('gallery-images', Admin\GalleryImageController::class);
            Route::post('gallery-images/bulk', [Admin\GalleryImageController::class, 'bulkStore']);
        });

        Route::middleware('can:manage_csr')->group(function () use ($crud) {
            $crud('csr-categories', Admin\CsrCategoryController::class);
            $crud('csr-projects', Admin\CsrProjectController::class);
        });

        Route::middleware('can:manage_careers')->group(function () use ($crud) {
            $crud('careers', Admin\CareerController::class);
        });

        Route::middleware('can:manage_inquiries')->group(function () {
            Route::get('inquiries/export', [Admin\InquiryController::class, 'export']);
            Route::get('inquiries', [Admin\InquiryController::class, 'index']);
            Route::get('inquiries/{inquiry}', [Admin\InquiryController::class, 'show']);
            Route::put('inquiries/{inquiry}', [Admin\InquiryController::class, 'update']);
            Route::delete('inquiries/{inquiry}', [Admin\InquiryController::class, 'destroy']);
        });

        Route::middleware('can:manage_applications')->group(function () {
            Route::get('applications', [Admin\JobApplicationController::class, 'index']);
            Route::get('applications/{application}', [Admin\JobApplicationController::class, 'show']);
            Route::put('applications/{application}', [Admin\JobApplicationController::class, 'update']);
            Route::delete('applications/{application}', [Admin\JobApplicationController::class, 'destroy']);
            Route::get('applications/{application}/cv', [Admin\JobApplicationController::class, 'downloadCv']);
        });

        Route::middleware('can:manage_settings')->group(function () {
            Route::get('settings', [Admin\SettingsController::class, 'show']);
            Route::put('settings/social', [Admin\SettingsController::class, 'updateSocial']);
            Route::put('settings/{group}', [Admin\SettingsController::class, 'update']);
        });

        Route::middleware('can:manage_users')->group(function () {
            Route::get('roles', [Admin\UserController::class, 'roles']);
            Route::get('users', [Admin\UserController::class, 'index']);
            Route::post('users', [Admin\UserController::class, 'store']);
            Route::get('users/{user}', [Admin\UserController::class, 'show']);
            Route::put('users/{user}', [Admin\UserController::class, 'update']);
            Route::delete('users/{user}', [Admin\UserController::class, 'destroy']);
        });

        Route::get('activity', [Admin\ActivityLogController::class, 'index'])->middleware('can:view_activity');
    });
});
