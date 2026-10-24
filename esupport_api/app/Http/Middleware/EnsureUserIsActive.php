<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects (and signs out) users whose account has been disabled by an administrator.
 */
class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && ! $user->is_active) {
            $user->currentAccessToken()?->delete();

            return response()->json(['message' => 'This account has been disabled.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
