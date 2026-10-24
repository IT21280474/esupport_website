<?php

use App\Http\Controllers\Api\V1\Admin\AccountController;
use App\Http\Controllers\Api\V1\Admin\ActivityLogController;
use App\Http\Controllers\Api\V1\Admin\CaptureScreenshotController;
use App\Http\Controllers\Api\V1\Admin\ContentApprovalController;
use App\Http\Controllers\Api\V1\Admin\ContentSectionController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ExportLeadsController;
use App\Http\Controllers\Api\V1\Admin\LeadController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\RestoreRevisionController;
use App\Http\Controllers\Api\V1\Admin\SchemaController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LeadSubmissionController;
use App\Http\Controllers\Api\V1\SiteContentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    /* Public website */
    Route::get('content', SiteContentController::class)->name('content');
    Route::post('leads', LeadSubmissionController::class)->middleware('throttle:leads')->name('leads.store');

    /* Authentication */
    Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

        /* Admin panel (admins + editors) */
        Route::prefix('admin')->name('admin.')->group(function (): void {
            Route::get('dashboard', DashboardController::class)->name('dashboard');
            Route::get('schema', SchemaController::class)->name('schema');

            Route::get('sections/{key}', [ContentSectionController::class, 'show'])->name('sections.show');
            Route::put('sections/{key}', [ContentSectionController::class, 'update'])->name('sections.update');
            Route::delete('sections/{key}', [ContentSectionController::class, 'destroy'])->name('sections.destroy');
            Route::post('sections/{key}/revisions/{revision}/restore', RestoreRevisionController::class)->name('sections.restore');
            Route::delete('sections/{key}/draft', [ContentSectionController::class, 'destroyDraft'])->name('sections.draft.destroy');

            Route::get('media', [MediaController::class, 'index'])->name('media.index');
            Route::post('media', [MediaController::class, 'store'])->name('media.store');
            Route::delete('media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
            Route::post('media/capture', CaptureScreenshotController::class)->name('media.capture');

            Route::get('leads', [LeadController::class, 'index'])->name('leads.index');
            Route::get('leads/export', ExportLeadsController::class)->name('leads.export');
            Route::patch('leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
            Route::delete('leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');

            Route::patch('account', [AccountController::class, 'update'])->name('account.update');
            Route::get('activity', [ActivityLogController::class, 'index'])->name('activity.index');

            /* Administrators only */
            Route::middleware('can:manage-users')->group(function (): void {
                Route::apiResource('users', UserController::class)->except('show');
            });

            Route::middleware('can:approve-content')->group(function (): void {
                Route::get('approvals', [ContentApprovalController::class, 'index'])->name('approvals.index');
                Route::get('approvals/{revision}', [ContentApprovalController::class, 'show'])->name('approvals.show');
                Route::post('approvals/{revision}/approve', [ContentApprovalController::class, 'approve'])->name('approvals.approve');
                Route::post('approvals/{revision}/reject', [ContentApprovalController::class, 'reject'])->name('approvals.reject');
            });
        });
    });
});
