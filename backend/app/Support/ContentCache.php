<?php

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Versioned cache for public API responses.
 *
 * Every cached entry key includes the current content version. Any CMS write
 * bumps the version, so stale entries are simply never read again and expire
 * on their own TTL — no tag support needed from the cache store.
 */
class ContentCache
{
    private const VERSION_KEY = 'content:version';

    public static function version(): int
    {
        return (int) Cache::rememberForever(self::VERSION_KEY, fn () => 1);
    }

    public static function bump(): void
    {
        Cache::forever(self::VERSION_KEY, self::version() + 1);
    }

    /**
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     */
    public static function remember(string $key, Closure $callback): mixed
    {
        return Cache::remember(
            'content:v'.self::version().':'.$key,
            config('muthumala.cache_ttl'),
            $callback,
        );
    }
}
