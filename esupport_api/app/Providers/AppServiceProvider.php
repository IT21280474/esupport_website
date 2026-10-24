<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Content\ContentSchema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ContentSchema::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-users', fn (User $user): bool => $user->isAdmin());
        Gate::define('reset-content', fn (User $user): bool => $user->isAdmin());
        /* Editors' content changes wait for an admin; admins publish directly. */
        Gate::define('approve-content', fn (User $user): bool => $user->isAdmin());

        RateLimiter::for('leads', fn (Request $request): Limit => Limit::perHour(5)
            ->by($request->ip())
            ->response(fn () => response()->json(['message' => "Thanks — we've already received your request."], 429)));
    }
}
