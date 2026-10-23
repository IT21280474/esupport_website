<?php

namespace App\Providers;

use App\Enums\Permission;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerPermissions();
        $this->registerRateLimits();

        // The admin SPA uses session cookies only. Ignoring bearer tokens stops
        // Sanctum looking for a personal_access_tokens table that doesn't exist.
        Sanctum::getAccessTokenFromRequestUsing(fn () => null);

        // In production, also reject passwords found in public breach lists (k-anonymity API)
        Password::defaults(fn () => $this->app->isProduction()
            ? Password::min(10)->letters()->numbers()->uncompromised(3)
            : Password::min(10)->letters()->numbers());

        // Password-reset emails link to the React admin, not a Laravel view
        ResetPassword::createUrlUsing(fn (User $user, string $token) => config('muthumala.frontend_url')
            .'/admin/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset()));
    }

    /** Every Permission enum case becomes a Gate ability usable as `can:<slug>`. */
    private function registerPermissions(): void
    {
        foreach (Permission::cases() as $permission) {
            Gate::define($permission->value, fn (User $user) => $user->hasPermission($permission));
        }
    }

    private function registerRateLimits(): void
    {
        // Generous: public reads are cached, and mobile networks (CGNAT) and offices put
        // many visitors behind one IP address. This only stops abusive bursts.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(1000)->by($request->ip()));

        RateLimiter::for('admin', fn (Request $request) => Limit::perMinute(300)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('forms', fn (Request $request) => [
            Limit::perMinute(10)->by($request->ip()),
            Limit::perHour(60)->by($request->ip()),
        ]);

        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(20)->by($request->ip()),
        ]);
    }
}
