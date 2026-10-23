<?php

namespace App\Cms;

/**
 * Small factory for section field definitions.
 *
 * A field is a plain array: ['key', 'type', 'label', ...options]. The same
 * definition drives the admin form (served as JSON), server-side validation,
 * sanitisation and media resolution — see SectionSchema.
 */
final class Field
{
    public const ART = [
        'lorry' => 'Lorry', 'bus' => 'Bus', 'tipper' => 'Tipper', 'parts' => 'Spare parts',
        'fleet' => 'Fleet', 'hotel' => 'Hotel', 'community' => 'Community',
    ];

    public const BUTTON_VARIANTS = [
        'primary' => 'Navy', 'light' => 'White', 'ghost' => 'Outline (dark text)',
        'ghost-light' => 'Outline (light text)', 'gold' => 'Gold', 'whatsapp' => 'WhatsApp green', 'hotel' => 'Hotel umber',
    ];

    public const WHATSAPP_DESKS = [
        '' => 'Not a WhatsApp button', 'general' => 'General', 'spare_parts' => 'Spare Parts',
        'transport' => 'Transportation', 'hotel' => 'Hotel',
    ];

    public static function text(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'text', 'label' => $label] + $extra;
    }

    public static function textarea(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'textarea', 'label' => $label] + $extra;
    }

    public static function richtext(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'richtext', 'label' => $label] + $extra;
    }

    public static function media(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'media', 'label' => $label] + $extra;
    }

    public static function url(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'url', 'label' => $label] + $extra;
    }

    /** @param  array<string, string>  $options */
    public static function select(string $key, string $label, array $options, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'select', 'label' => $label, 'options' => $options] + $extra;
    }

    public static function toggle(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'toggle', 'label' => $label] + $extra;
    }

    public static function number(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'number', 'label' => $label] + $extra;
    }

    public static function icon(string $key = 'icon', string $label = 'Icon'): array
    {
        return ['key' => $key, 'type' => 'icon', 'label' => $label];
    }

    public static function art(string $key = 'art', string $label = 'Placeholder art (shown until a photo is uploaded)'): array
    {
        return self::select($key, $label, self::ART);
    }

    /** List of short strings (chips, marquee words, checklist lines). */
    public static function tags(string $key, string $label, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'tags', 'label' => $label] + $extra;
    }

    /** Repeater of objects. */
    public static function list(string $key, string $label, array $fields, array $extra = []): array
    {
        return ['key' => $key, 'type' => 'list', 'label' => $label, 'fields' => $fields] + $extra;
    }

    public static function buttons(string $key = 'buttons', string $label = 'Buttons', int $max = 3): array
    {
        return self::list($key, $label, [
            self::text('label', 'Label', ['required' => true]),
            self::url('url', 'Link', ['help' => 'A page path such as /contact, a full URL, tel: or mailto:. Ignored for WhatsApp buttons.']),
            self::select('variant', 'Style', self::BUTTON_VARIANTS),
            self::select('whatsapp', 'WhatsApp desk', self::WHATSAPP_DESKS, ['help' => 'Opens WhatsApp with the desk number and message from Settings.']),
            self::select('icon', 'Icon', ['arrow' => 'Arrow', 'search' => 'Search', 'none' => 'None']),
        ], ['max' => $max, 'item_label' => 'label']);
    }

    public static function labelStyle(): array
    {
        return self::select('label_style', 'Label style', [
            'eyebrow' => 'Accent line + label',
            'number' => 'Numbered (monospace, grey)',
        ]);
    }

    /**
     * Standard section heading: label + label style + title + lead.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function heading(bool $multilineTitle = true, bool $lead = true): array
    {
        $fields = [
            self::text('label', 'Label', ['help' => 'Small caps label above the title, e.g. “Our Heritage” or “01 — OUR STORY”.']),
            self::labelStyle(),
            $multilineTitle
                ? self::textarea('title', 'Title', ['rows' => 2, 'help' => 'Press Enter to break the title onto a new line.'])
                : self::text('title', 'Title'),
        ];

        if ($lead) {
            $fields[] = self::textarea('lead', 'Intro text', ['rows' => 3]);
        }

        return $fields;
    }
}
