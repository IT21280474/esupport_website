<?php

namespace App\Cms;

use App\Cms\Field as F;

/**
 * Global settings, grouped into admin tabs. Field definitions reuse the
 * section field format so the admin renders them with the same form engine.
 *
 * Settings in groups marked 'public' => false are never sent to the website.
 */
final class SettingsRegistry
{
    /** @return array<string, array{label: string, public: bool, fields: array<int, array<string, mixed>>}> */
    public static function groups(): array
    {
        return [
            'company' => [
                'label' => 'Company',
                'public' => true,
                'fields' => [
                    F::text('name', 'Company name', ['required' => true]),
                    F::text('short_name', 'Logo wordmark', ['help' => 'Shown beside the logo, e.g. MUTHUMALA']),
                    F::text('tagline', 'Logo sub-line', ['help' => 'e.g. Group of Companies · Est. 1967']),
                    F::number('established', 'Year established', ['min' => 1800, 'max' => 2100]),
                    F::text('founder', 'Founder', ['help' => 'Shown to search engines as the company founder.']),
                    F::text('founded_in', 'Place founded', ['help' => 'e.g. Tangalle, Sri Lanka']),
                    F::textarea('description', 'Short description (footer)', ['rows' => 3]),
                    F::media('logo', 'Logo'),
                    F::media('favicon', 'Favicon (square PNG)'),
                ],
            ],
            'contact' => [
                'label' => 'Contact',
                'public' => true,
                'fields' => [
                    F::text('phone_1', 'Phone 1', ['required' => true]),
                    F::text('phone_2', 'Phone 2'),
                    F::text('phone_3', 'Phone 3'),
                    F::text('email', 'Email', ['required' => true]),
                    F::textarea('address', 'Address', ['rows' => 2]),
                    F::text('opening_hours', 'Opening hours'),
                ],
            ],
            'whatsapp' => [
                'label' => 'WhatsApp',
                'public' => true,
                'fields' => [
                    F::text('general_number', 'General number', ['help' => 'International format, digits only, e.g. 94771234567. Used when a desk has no number of its own.']),
                    F::textarea('general_message', 'General message', ['rows' => 2]),
                    F::text('spare_parts_number', 'Spare Parts number'),
                    F::textarea('spare_parts_message', 'Spare Parts message', ['rows' => 2]),
                    F::text('transport_number', 'Transportation number'),
                    F::textarea('transport_message', 'Transportation message', ['rows' => 2]),
                    F::text('hotel_number', 'Hotel number'),
                    F::textarea('hotel_message', 'Hotel message', ['rows' => 2]),
                ],
            ],
            'seo' => [
                'label' => 'SEO',
                'public' => true,
                'fields' => [
                    F::text('default_title', 'Default page title'),
                    F::text('title_suffix', 'Title suffix', ['help' => 'Appended to page titles that do not set their own SEO title, e.g. “ | Muthumala Group”']),
                    F::textarea('default_description', 'Default meta description', ['rows' => 3]),
                    F::media('og_image', 'Default social sharing image (1200×630)'),
                ],
            ],
            'website' => [
                'label' => 'Website',
                'public' => true,
                'fields' => [
                    F::toggle('maintenance_mode', 'Maintenance mode', ['help' => 'Shows a maintenance notice on the public site. The admin panel keeps working.']),
                    F::textarea('maintenance_message', 'Maintenance message', ['rows' => 2]),
                    F::text('header_cta_label', 'Header button label'),
                    F::url('header_cta_url', 'Header button link'),
                    F::text('copyright', 'Footer copyright', ['help' => '{year} is replaced with the current year.']),
                    F::text('footer_tagline', 'Footer tagline', ['help' => 'e.g. ~ ESTABLISHED 1967 ~']),
                    F::url('google_maps_embed_url', 'Google Maps embed URL', ['help' => 'From Google Maps → Share → Embed a map → copy the src="…" address.']),
                ],
            ],
            'navigation' => [
                'label' => 'Navigation',
                'public' => true,
                'fields' => [
                    F::list('primary', 'Main menu', [
                        F::text('label', 'Label', ['required' => true]),
                        F::url('url', 'Link', ['required' => true]),
                    ], ['max' => 12, 'item_label' => 'label']),
                    F::list('footer_columns', 'Footer columns', [
                        F::text('title', 'Column title', ['required' => true]),
                        F::list('links', 'Links', [
                            F::text('label', 'Label', ['required' => true]),
                            F::url('url', 'Link', ['required' => true]),
                        ], ['max' => 10, 'item_label' => 'label']),
                    ], ['max' => 4, 'item_label' => 'title']),
                ],
            ],
            'notifications' => [
                'label' => 'Notifications',
                'public' => false,
                'fields' => [
                    F::toggle('inquiry_emails', 'Email new inquiries'),
                    F::text('inquiry_recipients', 'Inquiry recipients', ['help' => 'Comma-separated email addresses.']),
                    F::toggle('application_emails', 'Email new job applications'),
                    F::text('application_recipients', 'Application recipients', ['help' => 'Comma-separated email addresses.']),
                ],
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    public static function forAdmin(): array
    {
        return collect(self::groups())
            ->map(fn (array $group, string $key) => ['key' => $key] + $group)
            ->values()
            ->all();
    }
}
