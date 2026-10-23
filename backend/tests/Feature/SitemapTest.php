<?php

namespace Tests\Feature;

use App\Enums\CareerStatus;
use App\Models\Career;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_lists_published_content_on_the_frontend_domain(): void
    {
        config(['muthumala.frontend_url' => 'https://www.muthumala.lk']); // from FRONTEND_URL

        Page::create(['slug' => 'home', 'title' => 'Home', 'is_published' => true]);
        Page::create(['slug' => 'about', 'title' => 'About', 'is_published' => true]);
        Page::create(['slug' => 'csr', 'title' => 'CSR', 'is_published' => false]);
        Product::create(['name' => 'Brake Drum', 'is_active' => true]);
        Product::create(['name' => 'Discontinued Part', 'is_active' => false]);
        Career::create(['title' => 'Stores Assistant', 'status' => CareerStatus::Published]);
        Career::create(['title' => 'Draft Role', 'status' => CareerStatus::Draft]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $this->assertStringStartsWith('application/xml', $response->headers->get('Content-Type'));

        $xml = simplexml_load_string($response->getContent());
        $this->assertNotFalse($xml, 'The sitemap must be well-formed XML.');

        $locations = array_map('strval', $xml->xpath('//*[local-name()="loc"]'));
        $this->assertEqualsCanonicalizing([
            'https://www.muthumala.lk/',
            'https://www.muthumala.lk/about',
            'https://www.muthumala.lk/spare-parts/brake-drum',
            'https://www.muthumala.lk/careers/stores-assistant',
        ], $locations);
    }

    public function test_sitemap_is_valid_when_there_is_no_content(): void
    {
        $response = $this->get('/sitemap.xml')->assertOk();

        $this->assertNotFalse(simplexml_load_string($response->getContent()));
        $response->assertSee('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', escape: false);
    }
}
