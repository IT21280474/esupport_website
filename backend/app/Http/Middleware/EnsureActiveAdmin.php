<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ends the session of a user who was deactivated (or lost their role) while
 * signed in, so access is revoked immediately rather than at session expiry.
 */
class EnsureActiveAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active || ! $user->role_id) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();

            abort(403, 'Your admin access has been disabled.');
        }

        return $next($request);
    }
}
