<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Public forms include a visually hidden "company_website" field. Humans never
 * fill it; bots usually do. Such submissions get a normal-looking success
 * response but are discarded.
 */
class Honeypot
{
    public const FIELD = 'company_website';

    public function handle(Request $request, Closure $next): Response
    {
        if (filled($request->input(self::FIELD))) {
            return response()->json(['message' => 'Thank you — your submission has been received.'], 201);
        }

        return $next($request);
    }
}
