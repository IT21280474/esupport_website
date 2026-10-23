<?php

namespace App\Cms;

use App\Cms\Field as F;

/**
 * Catalogue of page-section types available in the page builder.
 *
 * Each type maps 1:1 to a React section component (frontend/src/sections).
 * `data` names a SectionDataResolver method that attaches live records
 * (products, rooms, jobs...) to the section when the page is served.
 */
final class SectionRegistry
{
    /** @var array<string, array<string, mixed>>|null */
    private static ?array $types = null;

    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        return self::$types ??= self::define();
    }

    /** @return array<string, mixed>|null */
    public static function get(string $type): ?array
    {
        return self::all()[$type] ?? null;
    }

    public static function exists(string $type): bool
    {
        return isset(self::all()[$type]);
    }

    /** @return array<string, array<string, mixed>> */
    private static function define(): array
    {
        $imagePair = [
            F::media('image_a', 'Main image'),
            F::art('art_a', 'Main image placeholder art'),
            F::media('image_b', 'Overlapping image'),
            F::art('art_b', 'Overlapping image placeholder art'),
            F::text('media_label', 'Caption under images'),
        ];

        $milestoneFields = [
            F::text('year', 'Year / heading', ['required' => true]),
            F::text('title', 'Milestone title', ['help' => 'Optional, e.g. “The Foundation”.']),
            F::textarea('text', 'Text', ['rows' => 2]),
        ];

        $timelineItems = F::list('timeline', 'Timeline', $milestoneFields, ['max' => 8, 'item_label' => 'year']);

        return [

            // ------------------------------------------------------------ Heroes
            'home_hero' => [
                'label' => 'Home hero (fleet line-up)',
                'group' => 'Heroes',
                'description' => 'Full-screen opening with headline, buttons, the vehicle line-up image and a facts bar.',
                'fields' => [
                    F::text('label', 'Label', ['help' => 'e.g. ESTABLISHED 1967']),
                    F::text('title', 'Title', ['required' => true]),
                    F::text('title_accent', 'Title — second line'),
                    F::textarea('lead', 'Intro text', ['rows' => 2]),
                    F::buttons(),
                    F::media('image', 'Line-up image (wide, transparent or light background)'),
                    F::list('facts', 'Facts bar', [
                        F::text('title', 'Fact', ['required' => true]),
                        F::text('label', 'Small label'),
                    ], ['max' => 3, 'item_label' => 'title']),
                ],
            ],

            'page_hero' => [
                'label' => 'Page hero',
                'group' => 'Heroes',
                'description' => 'Large photo header with breadcrumb, label, title and optional buttons.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title', ['required' => true]),
                    F::text('title_accent', 'Title — lighter ending', ['help' => 'Shown after the title in a lighter weight (italic serif on the hotel page).']),
                    F::textarea('lead', 'Intro text', ['rows' => 2]),
                    F::buttons(),
                    F::media('image', 'Background image'),
                    F::art(),
                    F::select('size', 'Height', ['default' => 'Default', 'tall' => 'Tall', 'short' => 'Short']),
                ],
            ],

            // -------------------------------------------------------- Story & brand
            'heritage' => [
                'label' => 'Heritage statement + year',
                'group' => 'Story & brand',
                'description' => 'Statement with a large establishment year, emblem and a milestone timeline.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::labelStyle(),
                    F::text('title', 'Title'),
                    F::text('title_muted', 'Title — muted ending'),
                    F::textarea('text', 'Text', ['rows' => 4, 'help' => 'Leave a blank line between paragraphs.']),
                    F::text('link_label', 'Link label'),
                    F::url('link_url', 'Link'),
                    F::text('year', 'Big year', ['help' => 'e.g. 1967']),
                    F::text('year_label', 'Year caption'),
                    F::media('badge', 'Emblem (defaults to the site logo)'),
                    F::text('timeline_title', 'Timeline heading', ['help' => 'Optional, e.g. “The G. Muthumala Legacy”.']),
                    $timelineItems,
                ],
            ],

            'story_split' => [
                'label' => 'Story (text + overlapping images)',
                'group' => 'Story & brand',
                'description' => 'Long-form story text beside two overlapping photos, with an optional timeline below.',
                'fields' => [
                    ...F::heading(),
                    F::richtext('body', 'Body text'),
                    ...$imagePair,
                    $timelineItems,
                ],
            ],

            'journey' => [
                'label' => 'Journey chapters',
                'group' => 'Story & brand',
                'description' => 'Chapters of the group’s history: a large year beside a title, the story and a closing line.',
                'fields' => [
                    ...F::heading(),
                    F::list('items', 'Chapters', [
                        F::text('year', 'Year / period', ['required' => true, 'help' => 'e.g. 1967, 1980s or Today']),
                        F::text('title', 'Chapter title'),
                        F::richtext('body', 'Story'),
                        F::text('highlight', 'Closing line', ['help' => 'Optional sentence shown emphasised under the story.']),
                    ], ['max' => 12, 'item_label' => 'year']),
                    F::select('theme', 'Background', ['light' => 'White', 'off' => 'Light grey']),
                ],
            ],

            'headline_split' => [
                'label' => 'Stacked headline + overlapping images',
                'group' => 'Story & brand',
                'description' => 'Three-line stacked headline with chips and a button, beside two overlapping photos.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::labelStyle(),
                    F::tags('lines', 'Headline lines', ['max' => 3, 'help' => 'One line per entry (2nd line grey, 3rd line blue).']),
                    F::textarea('lead', 'Intro text', ['rows' => 3, 'help' => 'Leave a blank line between paragraphs.']),
                    F::tags('chips', 'Chips', ['max' => 10]),
                    F::buttons(),
                    ...$imagePair,
                ],
            ],

            'statements' => [
                'label' => 'Vision / mission statements',
                'group' => 'Story & brand',
                'description' => 'Dark band of large typographic statements with numbered labels.',
                'fields' => [
                    F::text('title', 'Hidden heading (screen readers)'),
                    F::list('items', 'Statements', [
                        F::text('label', 'Label', ['required' => true]),
                        F::textarea('text', 'Statement', ['rows' => 3, 'required' => true]),
                        F::text('anchor', 'Anchor id', ['help' => 'Optional, for links such as /about#mission']),
                    ], ['max' => 4, 'item_label' => 'label']),
                ],
            ],

            'chairman_message' => [
                'label' => 'Chairman / management message',
                'group' => 'Story & brand',
                'description' => 'Large quote with signature, beside a portrait (or the group emblem).',
                'fields' => [
                    F::text('label', 'Label'),
                    F::textarea('quote', 'Message', ['rows' => 6, 'required' => true]),
                    F::text('name', 'Name / title'),
                    F::text('role', 'Role / organisation'),
                    F::media('image', 'Portrait (leave empty to show the group emblem)'),
                ],
            ],

            'link_rows' => [
                'label' => 'Business area link rows',
                'group' => 'Story & brand',
                'description' => 'Numbered full-width rows linking to the business areas.',
                'fields' => [
                    ...F::heading(lead: false),
                    F::list('items', 'Rows', [
                        F::text('title', 'Title', ['required' => true]),
                        F::text('text', 'Text'),
                        F::url('url', 'Link', ['required' => true]),
                    ], ['max' => 8, 'item_label' => 'title']),
                ],
            ],

            // -------------------------------------------------------- Cards & grids
            'business_cards' => [
                'label' => 'Business / vehicle photo cards',
                'group' => 'Cards & grids',
                'description' => 'Large photo cards; the first card is the tall featured card.',
                'fields' => [
                    ...F::heading(),
                    F::list('cards', 'Cards', [
                        F::textarea('title', 'Title', ['rows' => 2, 'required' => true]),
                        F::text('text', 'Text'),
                        F::text('link_label', 'Link label'),
                        F::url('url', 'Link', ['required' => true]),
                        F::text('badge', 'Badge', ['help' => 'Optional, e.g. “Core business”']),
                        F::media('image', 'Image'),
                        F::art(),
                    ], ['max' => 5, 'item_label' => 'title']),
                    F::select('theme', 'Background', ['light' => 'White', 'off' => 'Light grey']),
                ],
            ],

            'parts_feature' => [
                'label' => 'Dark feature (image + text + chips)',
                'group' => 'Cards & grids',
                'description' => 'Edge-to-edge dark band: large photo on one side, text, chips and buttons on the other.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::textarea('title', 'Title', ['rows' => 2]),
                    F::textarea('lead', 'Intro text', ['rows' => 2]),
                    F::tags('chips', 'Chips', ['max' => 12]),
                    F::buttons(),
                    F::media('image', 'Image'),
                    F::art(),
                ],
            ],

            'vehicle_cards' => [
                'label' => 'Vehicle cards (3 across)',
                'group' => 'Cards & grids',
                'description' => 'Bordered cards with photo, title, short text and a link.',
                'fields' => [
                    F::list('cards', 'Cards', [
                        F::text('title', 'Title', ['required' => true]),
                        F::text('text', 'Text'),
                        F::text('link_label', 'Link label'),
                        F::url('url', 'Link'),
                        F::media('image', 'Image'),
                        F::art(),
                    ], ['max' => 6, 'item_label' => 'title']),
                ],
            ],

            'mobility' => [
                'label' => 'Vehicle panels + marquee (dark)',
                'group' => 'Cards & grids',
                'description' => 'Dark section with tall vehicle photo panels and a scrolling word marquee.',
                'fields' => [
                    ...F::heading(),
                    F::list('panels', 'Panels', [
                        F::text('title', 'Title', ['required' => true]),
                        F::text('caption', 'Caption'),
                        F::media('image', 'Image'),
                        F::art(),
                    ], ['max' => 3, 'item_label' => 'title']),
                    F::tags('marquee', 'Marquee words', ['max' => 10]),
                ],
            ],

            'feature_grid' => [
                'label' => 'Icon feature grid',
                'group' => 'Cards & grids',
                'description' => 'Grid of icon + title + text cells (benefits, capabilities, reasons to choose us).',
                'fields' => [
                    ...F::heading(),
                    F::list('items', 'Features', [
                        F::icon(),
                        F::text('title', 'Title', ['required' => true]),
                        F::textarea('text', 'Text', ['rows' => 2]),
                    ], ['max' => 10, 'item_label' => 'title']),
                    F::select('columns', 'Columns', ['3' => '3', '2' => '2', '5' => '5']),
                    F::select('layout', 'Layout', ['stacked' => 'Heading above grid', 'split' => 'Heading beside grid']),
                    F::select('theme', 'Background', ['light' => 'White', 'off' => 'Light grey', 'dark' => 'Dark navy']),
                ],
            ],

            'numbered_cards' => [
                'label' => 'Numbered cards (objectives)',
                'group' => 'Cards & grids',
                'description' => 'Bordered cards with a large faded number, title and text.',
                'fields' => [
                    ...F::heading(),
                    F::list('items', 'Cards', [
                        F::text('title', 'Title', ['required' => true]),
                        F::textarea('text', 'Text', ['rows' => 2]),
                    ], ['max' => 12, 'item_label' => 'title']),
                ],
            ],

            'values' => [
                'label' => 'Values list',
                'group' => 'Cards & grids',
                'description' => 'Numbered list of values in three columns.',
                'fields' => [
                    ...F::heading(),
                    F::list('items', 'Values', [
                        F::text('title', 'Title', ['required' => true]),
                        F::textarea('text', 'Text', ['rows' => 2]),
                    ], ['max' => 12, 'item_label' => 'title']),
                ],
            ],

            'stats' => [
                'label' => 'Statistics (dark)',
                'group' => 'Cards & grids',
                'description' => 'Dark band with heading and large figures.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title'),
                    F::text('title_muted', 'Title — muted second line'),
                    F::textarea('lead', 'Intro text', ['rows' => 2]),
                    F::list('stats', 'Figures', [
                        F::text('value', 'Figure', ['help' => 'Use {years} for years since establishment.', 'required' => true]),
                        F::text('suffix', 'Suffix', ['help' => 'e.g. +']),
                        F::text('label', 'Label', ['required' => true]),
                    ], ['max' => 4, 'item_label' => 'label']),
                ],
            ],

            'timeline' => [
                'label' => 'Timeline',
                'group' => 'Cards & grids',
                'description' => 'Heading with a horizontal milestone timeline.',
                'fields' => [
                    ...F::heading(lead: false),
                    F::list('items', 'Milestones', $milestoneFields, ['max' => 8, 'item_label' => 'year']),
                    F::select('theme', 'Background', ['dark' => 'Dark navy', 'light' => 'White']),
                ],
            ],

            'testimonials' => [
                'label' => 'Testimonials',
                'group' => 'Cards & grids',
                'description' => 'Large quotes with attribution. Only add genuine, approved testimonials.',
                'fields' => [
                    ...F::heading(lead: false),
                    F::list('items', 'Quotes', [
                        F::textarea('quote', 'Quote', ['rows' => 3, 'required' => true]),
                        F::text('cite', 'Name / company', ['required' => true]),
                    ], ['max' => 6, 'item_label' => 'cite']),
                ],
            ],

            'faq' => [
                'label' => 'FAQ',
                'group' => 'Cards & grids',
                'description' => 'Expandable questions and answers.',
                'fields' => [
                    ...F::heading(),
                    F::list('items', 'Questions', [
                        F::text('question', 'Question', ['required' => true]),
                        F::textarea('answer', 'Answer', ['rows' => 3, 'required' => true]),
                    ], ['max' => 20, 'item_label' => 'question']),
                ],
            ],

            // ------------------------------------------------------- Text & media
            'intro_split' => [
                'label' => 'Intro (title beside text)',
                'group' => 'Text & media',
                'description' => 'Short title on the left, intro paragraph on the right.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::textarea('title', 'Title', ['rows' => 2]),
                    F::textarea('lead', 'Text', ['rows' => 4]),
                    F::select('accent', 'Label colour', ['navy' => 'Navy', 'csr' => 'CSR green', 'hotel' => 'Hotel bronze']),
                ],
            ],

            'text_image' => [
                'label' => 'Text + image',
                'group' => 'Text & media',
                'description' => 'Two columns: a photo and a text block with buttons.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title'),
                    F::text('title_accent', 'Title — accent ending'),
                    F::textarea('lead', 'Text', ['rows' => 3]),
                    F::buttons(),
                    F::media('image', 'Image'),
                    F::art(),
                    F::select('image_position', 'Image position', ['left' => 'Left', 'right' => 'Right']),
                    F::select('theme', 'Background', ['dark' => 'Dark', 'light' => 'White', 'off' => 'Light grey', 'cream' => 'Cream']),
                ],
            ],

            'hotel_feature' => [
                'label' => 'Hospitality feature (serif)',
                'group' => 'Text & media',
                'description' => 'Elegant serif heading with two portrait photos.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title'),
                    F::text('title_accent', 'Title — italic accent'),
                    F::text('title_end', 'Title — ending after accent'),
                    F::textarea('lead', 'Text', ['rows' => 4, 'help' => 'Leave a blank line between paragraphs.']),
                    F::buttons(),
                    F::media('image_a', 'First image'),
                    F::media('image_b', 'Second image'),
                    F::select('theme', 'Background', ['cream' => 'Cream', 'light' => 'Page background']),
                ],
            ],

            'csr_feature' => [
                'label' => 'CSR band + pillars',
                'group' => 'Text & media',
                'description' => 'Green CSR panel beside a photo, followed by four pillar cards.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title'),
                    F::textarea('lead', 'Text', ['rows' => 2]),
                    F::buttons(),
                    F::media('image', 'Image'),
                    F::list('pillars', 'Pillars', [
                        F::icon(),
                        F::text('title', 'Title', ['required' => true]),
                        F::text('text', 'Text'),
                    ], ['max' => 4, 'item_label' => 'title']),
                ],
            ],

            'image_mosaic' => [
                'label' => 'Photo mosaic',
                'group' => 'Text & media',
                'description' => 'Four-photo editorial mosaic with an optional link.',
                'fields' => [
                    ...F::heading(),
                    F::text('link_label', 'Link label'),
                    F::url('link_url', 'Link'),
                    F::list('images', 'Photos', [
                        F::media('image', 'Image'),
                        F::art(),
                        F::text('alt', 'Description (if the image has no alt text)'),
                    ], ['max' => 4]),
                    F::select('theme', 'Background', ['light' => 'White', 'off' => 'Light grey']),
                ],
            ],

            'rich_text' => [
                'label' => 'Rich text',
                'group' => 'Text & media',
                'description' => 'Free-form formatted text.',
                'fields' => [
                    ...F::heading(lead: false),
                    F::richtext('body', 'Body'),
                ],
            ],

            // -------------------------------------------------------- Calls to action
            'cta_band' => [
                'label' => 'Call to action band (dark)',
                'group' => 'Calls to action',
                'description' => 'Large centred headline with buttons on a dark grid background.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title', ['required' => true]),
                    F::text('title_muted', 'Title — muted ending'),
                    F::buttons(),
                ],
            ],

            'cta_inline' => [
                'label' => 'Call to action panel',
                'group' => 'Calls to action',
                'description' => 'Contained panel with text and buttons.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title', ['required' => true]),
                    F::textarea('text', 'Text', ['rows' => 2, 'help' => 'You can use {phone_1}, {phone_2}, {phone_3} or {email} to insert contact links.']),
                    F::buttons(),
                    F::select('theme', 'Colour', ['navy' => 'Navy', 'csr' => 'CSR green']),
                ],
            ],

            // ---------------------------------------------------- Live data sections
            'product_categories' => [
                'label' => 'Spare-part categories',
                'group' => 'Spare parts',
                'description' => 'Icon grid of product categories (managed under Spare Parts → Categories).',
                'data' => 'productCategories',
                'fields' => [
                    ...F::heading(),
                    F::text('cta_title', 'Last tile title', ['help' => 'e.g. Can’t find your category?']),
                    F::text('cta_label', 'Last tile link label'),
                    F::url('cta_url', 'Last tile link'),
                    F::textarea('note', 'Note under grid', ['rows' => 2]),
                ],
            ],

            'part_finder' => [
                'label' => 'Part finder',
                'group' => 'Spare parts',
                'description' => 'Vehicle / model / category / part-number search that lists matching products and sends the request to the spare parts desk.',
                'data' => 'partFinder',
                'fields' => [
                    ...F::heading(),
                    F::tags('checklist', 'Checklist', ['max' => 5]),
                    F::list('model_groups', 'Vehicle models', [
                        F::text('group', 'Make', ['required' => true]),
                        F::tags('models', 'Models'),
                    ], ['max' => 6, 'item_label' => 'group']),
                ],
            ],

            'product_catalogue' => [
                'label' => 'Product catalogue (search & filter)',
                'group' => 'Spare parts',
                'description' => 'Searchable, filterable product listing. Hidden automatically while no products are published.',
                'data' => 'productCatalogue',
                'fields' => [
                    ...F::heading(),
                    F::toggle('featured_only', 'Show featured products only (no filters)'),
                    F::number('limit', 'Products per page', ['min' => 4, 'max' => 48]),
                ],
            ],

            'brand_grid' => [
                'label' => 'Brands we distribute',
                'group' => 'Spare parts',
                'description' => 'Brand logo tiles (managed under Spare Parts → Brands).',
                'data' => 'brands',
                'fields' => [
                    ...F::heading(),
                    F::toggle('logos_only', 'Only brands with a logo', ['help' => 'Hides brands that have no logo uploaded yet.']),
                ],
            ],

            'fleet_grid' => [
                'label' => 'Fleet mosaic',
                'group' => 'Transportation',
                'description' => 'Photo mosaic of fleet items (managed under Transportation → Fleet).',
                'data' => 'fleet',
                'fields' => F::heading(),
            ],

            'service_grid' => [
                'label' => 'Transport services',
                'group' => 'Transportation',
                'description' => 'Dark service cards (managed under Transportation → Services).',
                'data' => 'transportServices',
                'fields' => [
                    ...F::heading(),
                    F::toggle('featured_only', 'Featured services only'),
                ],
            ],

            'transport_enquiry' => [
                'label' => 'Transport request form',
                'group' => 'Transportation',
                'description' => 'Dark enquiry form; service types come from the transport services list.',
                'data' => 'transportServices',
                'fields' => [
                    ...F::heading(),
                    F::buttons(),
                ],
            ],

            'room_grid' => [
                'label' => 'Hotel rooms',
                'group' => 'Hotel',
                'description' => 'Room cards (managed under Hotel → Rooms).',
                'data' => 'rooms',
                'fields' => F::heading(),
            ],

            'amenity_grid' => [
                'label' => 'Hotel amenities',
                'group' => 'Hotel',
                'description' => 'Amenity grid (managed under Hotel → Amenities).',
                'data' => 'amenities',
                'fields' => F::heading(),
            ],

            'hotel_reservation' => [
                'label' => 'Reservation form',
                'group' => 'Hotel',
                'description' => 'Booking enquiry form with reservation contact details.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title'),
                    F::text('note', 'Enquiries note'),
                    F::media('image', 'Image under contact details'),
                    F::buttons(),
                ],
            ],

            'csr_focus_areas' => [
                'label' => 'CSR focus areas',
                'group' => 'CSR',
                'description' => 'Pillar cards from the CSR categories (managed under CSR → Categories).',
                'data' => 'csrCategories',
                'fields' => F::heading(),
            ],

            'project_grid' => [
                'label' => 'CSR projects',
                'group' => 'CSR',
                'description' => 'Project cards linking to each project page (managed under CSR → Projects).',
                'data' => 'csrProjects',
                'fields' => [
                    ...F::heading(),
                    F::toggle('featured_only', 'Featured projects only'),
                    F::number('limit', 'Maximum projects', ['min' => 1, 'max' => 48]),
                ],
            ],

            'gallery' => [
                'label' => 'Gallery (filter + lightbox)',
                'group' => 'Gallery',
                'description' => 'Masonry gallery with album filters and a lightbox (managed under Gallery).',
                'data' => 'gallery',
                'fields' => [
                    F::text('title', 'Hidden heading (screen readers)'),
                    F::toggle('featured_only', 'Featured images only'),
                    F::number('limit', 'Maximum images (0 = all)', ['min' => 0, 'max' => 200]),
                ],
            ],

            'job_list' => [
                'label' => 'Job openings',
                'group' => 'Careers',
                'description' => 'Open positions (managed under Careers → Jobs).',
                'data' => 'jobs',
                'fields' => [
                    ...F::heading(),
                    F::text('empty_text', 'Message when there are no openings'),
                ],
            ],

            'application_form' => [
                'label' => 'Job application form',
                'group' => 'Careers',
                'description' => 'CV upload form; positions come from open jobs.',
                'data' => 'jobs',
                'fields' => F::heading(),
            ],

            'contact_desks' => [
                'label' => 'Contact desks',
                'group' => 'Contact',
                'description' => 'One card per business desk with phone, email and WhatsApp.',
                'fields' => [
                    ...F::heading(),
                    F::list('desks', 'Desks', [
                        F::text('title', 'Desk name', ['required' => true]),
                        F::text('phone', 'Phone', ['help' => 'Leave empty to use the main phone number.']),
                        F::text('email', 'Email', ['help' => 'Leave empty to use the main email.']),
                        F::select('whatsapp', 'WhatsApp desk', F::WHATSAPP_DESKS),
                        F::select('accent', 'Top border colour', ['navy' => 'Navy', 'blue' => 'Blue', 'hotel' => 'Hotel bronze', 'silver' => 'Silver']),
                        F::text('button_label', 'Button label (non-WhatsApp)'),
                        F::url('button_url', 'Button link (non-WhatsApp)'),
                    ], ['max' => 6, 'item_label' => 'title']),
                ],
            ],

            'locations' => [
                'label' => 'Locations',
                'group' => 'Contact',
                'description' => 'Branch / office cards.',
                'fields' => [
                    ...F::heading(),
                    F::list('items', 'Locations', [
                        F::text('label', 'Label', ['help' => 'e.g. HEAD OFFICE']),
                        F::text('name', 'Name', ['required' => true]),
                        F::textarea('address', 'Address', ['rows' => 2]),
                        F::text('phone', 'Phone'),
                        F::text('phone_note', 'Text before phone', ['help' => 'e.g. Via head office:']),
                    ], ['max' => 8, 'item_label' => 'name']),
                ],
            ],

            'contact_form' => [
                'label' => 'Contact form + office details',
                'group' => 'Contact',
                'description' => 'Office details from Settings beside the contact form.',
                'fields' => [
                    F::text('label', 'Label'),
                    F::text('title', 'Title'),
                    F::text('hours', 'Opening hours'),
                ],
            ],

            'map' => [
                'label' => 'Google map',
                'group' => 'Contact',
                'description' => 'Full-width map using the embed URL from Settings.',
                'fields' => [
                    F::text('title', 'Map title (accessibility)'),
                ],
            ],

            // ------------------------------------------------------- Home features
            'featured_products' => [
                'label' => 'Featured products',
                'group' => 'Spare parts',
                'description' => 'Featured spare parts. Hidden automatically while no products are featured.',
                'data' => 'featuredProducts',
                'fields' => [
                    ...F::heading(),
                    F::number('limit', 'Number of products', ['min' => 1, 'max' => 12]),
                ],
            ],

            'gallery_preview' => [
                'label' => 'Featured gallery images',
                'group' => 'Gallery',
                'description' => 'Featured gallery photos with a link to the full gallery.',
                'data' => 'galleryPreview',
                'fields' => [
                    ...F::heading(),
                    F::number('limit', 'Number of images', ['min' => 2, 'max' => 12]),
                    F::text('link_label', 'Link label'),
                ],
            ],
        ];
    }

    /**
     * Admin-facing catalogue (labels, groups and field definitions).
     *
     * @return array<int, array<string, mixed>>
     */
    public static function forAdmin(): array
    {
        return collect(self::all())
            ->map(fn (array $definition, string $type) => [
                'type' => $type,
                'label' => $definition['label'],
                'group' => $definition['group'],
                'description' => $definition['description'],
                'fields' => $definition['fields'],
            ])
            ->values()
            ->all();
    }
}
