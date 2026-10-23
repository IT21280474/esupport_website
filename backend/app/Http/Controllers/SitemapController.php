<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\CsrProject;
use App\Models\Page;
use App\Models\Product;
use App\Support\ContentCache;
use Illuminate\Http\Response;

/**
 * sitemap.xml for the React site. URLs point at FRONTEND_URL; the frontend
 * host proxies /sitemap.xml here (see frontend/vercel.json).
 */
class SitemapController extends Controller
{
    /** CMS page slug => public path */
    public const PAGE_PATHS = [
        'home' => '/', 'about' => '/about', 'spare-parts' => '/spare-parts', 'transportation' => '/transportation',
        'hotel' => '/hotel', 'csr' => '/csr', 'gallery' => '/gallery', 'careers' => '/careers', 'contact' => '/contact',
    ];

    public function __invoke(): Response
    {
        $xml = ContentCache::remember('sitemap', function () {
            $base = config('muthumala.frontend_url');
            $urls = [];

            foreach (Page::where('is_published', true)->get() as $page) {
                if (isset(self::PAGE_PATHS[$page->slug])) {
                    $urls[] = [$base.self::PAGE_PATHS[$page->slug], $page->updated_at, $page->slug === 'home' ? '1.0' : '0.8'];
                }
            }

            foreach (Product::active()->get(['slug', 'updated_at']) as $product) {
                $urls[] = ["{$base}/spare-parts/{$product->slug}", $product->updated_at, '0.6'];
            }
            foreach (CsrProject::active()->get(['slug', 'updated_at']) as $project) {
                $urls[] = ["{$base}/csr/{$project->slug}", $project->updated_at, '0.5'];
            }
            foreach (Career::open()->get(['slug', 'updated_at']) as $career) {
                $urls[] = ["{$base}/careers/{$career->slug}", $career->updated_at, '0.5'];
            }

            $body = collect($urls)->map(fn ($url) => sprintf(
                '  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>',
                e($url[0]),
                $url[1]?->toAtomString(),
                $url[2],
            ))->implode("\n");

            return '<?xml version="1.0" encoding="UTF-8"?>'."\n"
                .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n{$body}\n</urlset>\n";
        });

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
