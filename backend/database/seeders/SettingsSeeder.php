<?php

namespace Database\Seeders;

use App\Models\SocialLink;
use App\Services\SettingsService;
use Illuminate\Database\Seeder;

/**
 * Verified company details (from the client brief) and prototype defaults.
 * Everything here is editable in Admin → Settings.
 */
class SettingsSeeder extends Seeder
{
    public function run(SettingsService $settings): void
    {
        $settings->updateGroup('company', [
            'name' => 'Muthumala Group of Companies',
            'short_name' => 'MUTHUMALA',
            'tagline' => 'Group of Companies · Est. 1967',
            'established' => 1967,
            'founder' => 'G. Muthumala',
            'founded_in' => 'Tangalle, Sri Lanka',
            'description' => 'A diversified family enterprise founded in Tangalle in 1967 — goods transportation, motor spare parts, and tourism & hospitality, built on a commitment to providing the best service.',
            'logo' => MediaSeeder::id('logo-emblem'),
            'favicon' => MediaSeeder::id('logo-emblem'),
        ]);

        $settings->updateGroup('contact', [
            'phone_1' => '0112384237',
            'phone_2' => '0716884650',
            'phone_3' => '0716884649',
            'email' => 'gmuthumalamotors@gmail.com',
            'address' => 'No 396, George R De Silva Mawatha, Colombo 13, Sri Lanka',
            'opening_hours' => 'Monday – Saturday · please call ahead to confirm times',
        ]);

        // TO CONFIRM WITH CLIENT: the general WhatsApp number defaults to the
        // company mobile 0716884650. Desk-specific numbers are left blank and
        // fall back to the general number until the client supplies them.
        $settings->updateGroup('whatsapp', [
            'general_number' => '94716884650',
            'general_message' => 'Hello Muthumala Group, I would like to make an inquiry.',
            'spare_parts_number' => null,
            'spare_parts_message' => 'Hello Muthumala Group, I would like to inquire about spare parts.',
            'transport_number' => null,
            'transport_message' => 'Hello Muthumala Group, I would like to inquire about transportation services.',
            'hotel_number' => null,
            'hotel_message' => 'Hello Muthumala Group, I would like to inquire about the hotel.',
        ]);

        $settings->updateGroup('seo', [
            'default_title' => 'Muthumala Group of Companies | Tata & Leyland Spare Parts Sri Lanka · Est. 1967',
            'title_suffix' => ' | Muthumala Group',
            'default_description' => 'Muthumala Group of Companies, established 1967 — Tata and Leyland commercial vehicle spare parts for lorries, buses and tippers, plus transportation, hospitality and community projects in Sri Lanka.',
            'og_image' => MediaSeeder::id('hero-fleet'),
        ]);

        $settings->updateGroup('website', [
            'maintenance_mode' => false,
            'maintenance_message' => 'We are making some improvements to our website. Please check back shortly — or call us on {phone_1}.',
            'header_cta_label' => 'Get in touch',
            'header_cta_url' => '/contact',
            'copyright' => '© {year} Muthumala Group of Companies. All Rights Reserved.',
            'footer_tagline' => '~ ESTABLISHED 1967 ~',
            'google_maps_embed_url' => 'https://www.google.com/maps?q=396+George+R+De+Silva+Mawatha,+Colombo+13,+Sri+Lanka&output=embed',
        ]);

        $settings->updateGroup('navigation', [
            'primary' => [
                ['label' => 'Home', 'url' => '/'],
                ['label' => 'About', 'url' => '/about'],
                ['label' => 'Spare Parts', 'url' => '/spare-parts'],
                ['label' => 'Transportation', 'url' => '/transportation'],
                ['label' => 'Hotel', 'url' => '/hotel'],
                ['label' => 'CSR', 'url' => '/csr'],
                ['label' => 'Gallery', 'url' => '/gallery'],
                ['label' => 'Careers', 'url' => '/careers'],
                ['label' => 'Contact', 'url' => '/contact'],
            ],
            'footer_columns' => [
                ['title' => 'Company', 'links' => [
                    ['label' => 'About', 'url' => '/about'],
                    ['label' => 'Our Journey', 'url' => '/about#journey'],
                    ['label' => 'Vision & Mission', 'url' => '/about#vision'],
                    ['label' => 'Chairman’s Message', 'url' => '/about#chairman'],
                    ['label' => 'Careers', 'url' => '/careers'],
                ]],
                ['title' => 'Business', 'links' => [
                    ['label' => 'Spare Parts', 'url' => '/spare-parts'],
                    ['label' => 'Transportation', 'url' => '/transportation'],
                    ['label' => 'Hotel', 'url' => '/hotel'],
                    ['label' => 'CSR Projects', 'url' => '/csr'],
                ]],
                ['title' => 'Explore', 'links' => [
                    ['label' => 'Gallery', 'url' => '/gallery'],
                    ['label' => 'Contact', 'url' => '/contact'],
                ]],
            ],
        ]);

        $settings->updateGroup('notifications', [
            'inquiry_emails' => true,
            'inquiry_recipients' => 'gmuthumalamotors@gmail.com',
            'application_emails' => true,
            'application_recipients' => 'gmuthumalamotors@gmail.com',
        ]);

        // Only the Facebook page is known (linked from the prototype). Other
        // platforms stay empty — the site only shows platforms with a URL.
        foreach (SocialLink::PLATFORMS as $position => $platform) {
            SocialLink::updateOrCreate(['platform' => $platform], [
                'url' => $platform === 'facebook' ? 'https://web.facebook.com/muthumalagroup/' : null,
                'sort_order' => $position,
                'is_active' => true,
            ]);
        }
    }
}
