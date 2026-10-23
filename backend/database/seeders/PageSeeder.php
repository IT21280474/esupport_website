<?php

namespace Database\Seeders;

use App\Cms\SectionRegistry;
use App\Cms\SectionSchema;
use App\Models\Page;
use Illuminate\Database\Seeder;

/**
 * The nine website pages and their sections, transcribed from the HTML
 * prototype (muthumala-group_15.html). All copy is editable in Admin → Pages.
 */
class PageSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->pages() as $slug => $page) {
            if (Page::where('slug', $slug)->exists()) {
                continue;
            }

            $model = Page::create([
                'slug' => $slug,
                'title' => $page['title'],
                'meta_title' => $page['meta_title'],
                'meta_description' => $page['meta_description'],
                'theme' => $page['theme'] ?? 'default',
                'floating_whatsapp' => $page['whatsapp'] ?? null,
                'is_published' => true,
            ]);

            foreach ($page['sections'] as $position => $section) {
                $fields = SectionRegistry::get($section['type'])['fields'];
                $model->sections()->create([
                    'type' => $section['type'],
                    'name' => $section['name'] ?? null,
                    'anchor' => $section['anchor'] ?? null,
                    'content' => SectionSchema::sanitize($fields, $section['content']),
                    'sort_order' => $position,
                    'is_enabled' => $section['enabled'] ?? true,
                ]);
            }
        }
    }

    private static function button(string $label, ?string $url = null, string $variant = 'light', ?string $whatsapp = null, string $icon = 'arrow'): array
    {
        return ['label' => $label, 'url' => $url, 'variant' => $variant, 'whatsapp' => $whatsapp, 'icon' => $whatsapp ? 'none' : $icon];
    }

    private static function wa(string $label, string $desk, string $variant = 'whatsapp'): array
    {
        return self::button($label, null, $variant, $desk);
    }

    private static function img(string $key): int
    {
        return MediaSeeder::id($key);
    }

    /**
     * The G. Muthumala legacy in four milestones (client history, HISTORY 1.docx).
     *
     * @return array<int, array{year: string, title: string, text: string}>
     */
    private static function legacyTimeline(): array
    {
        return [
            ['year' => '1967', 'title' => 'The Foundation', 'text' => 'A vision begins in Tangalle with goods transportation.'],
            ['year' => '1980s', 'title' => 'The Expansion', 'text' => 'The Group enters the importation and distribution of motor spare parts.'],
            ['year' => '2016', 'title' => 'The New Horizon', 'text' => 'The Group enters tourism and hospitality with the establishment of a three-star hotel in Tangalle.'],
            ['year' => 'Today', 'title' => 'The Legacy Continues', 'text' => 'A diversified family enterprise carrying forward its heritage across transportation, automotive, and tourism.'],
        ];
    }

    private function pages(): array
    {
        return [
            'home' => $this->home(),
            'about' => $this->about(),
            'spare-parts' => $this->spareParts(),
            'transportation' => $this->transportation(),
            'hotel' => $this->hotel(),
            'csr' => $this->csr(),
            'gallery' => $this->gallery(),
            'careers' => $this->careers(),
            'contact' => $this->contact(),
        ];
    }

    private function home(): array
    {
        return [
            'title' => 'Home',
            'meta_title' => 'Muthumala Group of Companies | Tata & Leyland Spare Parts Sri Lanka · Est. 1967',
            'meta_description' => 'Muthumala Group of Companies, established 1967 — Tata and Leyland commercial vehicle spare parts for lorries, buses and tippers, plus transportation, hospitality and community projects in Sri Lanka.',
            'sections' => [
                ['type' => 'home_hero', 'content' => [
                    'label' => 'ESTABLISHED 1967',
                    'title' => 'Built on Trust.',
                    'title_accent' => 'Driven by Generations.',
                    'lead' => 'Trusted automotive solutions, transportation services and hospitality — built on decades of experience.',
                    'buttons' => [self::button('Explore Spare Parts', '/spare-parts'), self::button('Our Group', '/about', 'ghost-light', icon: 'none')],
                    'image' => self::img('hero-fleet'),
                    'facts' => [
                        ['title' => 'Since 1967', 'label' => 'Sri Lankan heritage'],
                        ['title' => 'Tata & Leyland', 'label' => 'Commercial vehicle parts'],
                        ['title' => 'Lorries · Buses · Tippers', 'label' => 'Built around mobility'],
                    ],
                ]],
                ['type' => 'heritage', 'content' => [
                    'label' => 'Our Heritage',
                    'title' => 'More than a business.',
                    'title_muted' => 'A legacy built since 1967.',
                    'text' => "What began in 1967 in Tangalle as a modest goods transportation venture has evolved into a diversified family enterprise with interests spanning Transportation, Motor Spare Parts, and Tourism.\n\nThrough every chapter of our journey, one principle has remained constant: our commitment to providing the best service.",
                    'link_label' => 'Read our journey',
                    'link_url' => '/about#journey',
                    'year' => '1967',
                    'year_label' => 'Established · Tangalle',
                    'badge' => self::img('logo-emblem'),
                    'timeline_title' => 'The G. Muthumala Legacy',
                    'timeline' => self::legacyTimeline(),
                ]],
                ['type' => 'business_cards', 'content' => [
                    'label' => 'Our Businesses',
                    'title' => "One group.\nFour ways we move Sri Lanka.",
                    'lead' => 'Commercial vehicle spare parts sit at the heart of the group — supported by transportation, hospitality and a long-standing commitment to community.',
                    'cards' => [
                        ['title' => "Automotive\nSpare Parts", 'text' => 'Tata & Leyland commercial vehicle spare parts.', 'link_label' => 'Explore Spare Parts', 'url' => '/spare-parts', 'badge' => 'Core business', 'image' => self::img('lorry'), 'art' => 'parts'],
                        ['title' => 'Transportation', 'text' => 'Reliable goods transportation — where our story began in 1967.', 'link_label' => 'Explore Transportation', 'url' => '/transportation', 'image' => self::img('road'), 'art' => 'fleet'],
                        ['title' => 'Hospitality', 'text' => 'A three-star hotel in Tangalle, welcoming guests since 2016.', 'link_label' => 'Explore Hotel', 'url' => '/hotel', 'image' => self::img('hotel-exterior'), 'art' => 'hotel'],
                        ['title' => 'CSR / Community', 'text' => 'Creating value beyond business.', 'link_label' => 'View CSR Projects', 'url' => '/csr', 'image' => self::img('csr-books'), 'art' => 'community'],
                    ],
                    'theme' => 'off',
                ]],
                ['type' => 'parts_feature', 'content' => [
                    'label' => '01 — Spare Parts',
                    'title' => 'Parts that keep businesses moving.',
                    'lead' => 'Reliable spare parts solutions for commercial vehicles and heavy-duty applications — focused on Tata and Leyland.',
                    'chips' => ['Engine', 'Brakes', 'Clutch', 'Suspension', 'Steering', 'Electrical', 'Filters'],
                    'buttons' => [self::button('Explore Spare Parts', '/spare-parts'), self::button('Find a part', '/spare-parts#finder', 'ghost-light', icon: 'search')],
                    'image' => self::img('parts'),
                    'art' => 'parts',
                ]],
                ['type' => 'vehicle_cards', 'content' => [
                    'cards' => [
                        ['title' => 'Lorries', 'text' => 'Components for the lorries that carry Sri Lanka’s goods.', 'link_label' => 'View lorry parts', 'url' => '/spare-parts?vehicle=lorries#finder', 'image' => self::img('lorry'), 'art' => 'lorry'],
                        ['title' => 'Buses', 'text' => 'Parts for the buses that move people every day.', 'link_label' => 'View bus parts', 'url' => '/spare-parts?vehicle=buses#finder', 'image' => self::img('lanka-bus'), 'art' => 'bus'],
                        ['title' => 'Tippers', 'text' => 'Heavy-duty parts for construction and haulage.', 'link_label' => 'View tipper parts', 'url' => '/spare-parts?vehicle=tippers#finder', 'image' => self::img('tipper'), 'art' => 'tipper'],
                    ],
                ]],
                ['type' => 'mobility', 'content' => [
                    'label' => 'Vehicles we support',
                    'title' => 'Built Around Commercial Mobility',
                    'lead' => 'Every part we supply has one job: keep a working vehicle on the road and its owner’s business running.',
                    'panels' => [
                        ['title' => 'Lorries', 'caption' => '01 · Goods transport', 'image' => self::img('lorry'), 'art' => 'lorry'],
                        ['title' => 'Buses', 'caption' => '02 · Passenger transport', 'image' => self::img('bus'), 'art' => 'bus'],
                        ['title' => 'Tippers', 'caption' => '03 · Construction & haulage', 'image' => self::img('tipper'), 'art' => 'tipper'],
                    ],
                    'marquee' => ['Tata', 'Leyland', 'Lorries', 'Buses', 'Tippers', 'Since 1967'],
                ]],
                ['type' => 'brand_grid', 'anchor' => 'brands', 'content' => [
                    'label' => 'Brands we distribute',
                    'title' => "Trusted brands.\nImported and distributed by us.",
                    'lead' => 'Some of the recognised brands Muthumala imports and distributes for commercial vehicles across Sri Lanka.',
                    'logos_only' => true,
                ]],
                ['type' => 'headline_split', 'content' => [
                    'label' => '02 — Transportation',
                    'lines' => ['Moving People.', 'Moving Business.', 'Moving Forward.'],
                    'lead' => 'Goods transportation is where our story began — in Tangalle, in 1967. Today it is backed by the same mechanical know-how that runs through our spare parts business.',
                    'chips' => ['Buses', 'Lorries', 'Tippers'],
                    'buttons' => [self::button('View Transport Services', '/transportation', 'primary')],
                    'image_a' => self::img('road'), 'art_a' => 'fleet',
                    'image_b' => self::img('lanka-bus'), 'art_b' => 'bus',
                    'media_label' => 'Buses · Lorries · Tippers',
                ]],
                ['type' => 'hotel_feature', 'content' => [
                    'label' => '03 — Hospitality',
                    'title' => 'Hospitality with the',
                    'title_accent' => 'Muthumala',
                    'title_end' => 'touch.',
                    'lead' => 'Muthumala Hospitality — a three-star hotel in Tangalle, welcoming guests to the southern coast since 2016 with the same care the group has given its customers since 1967.',
                    'buttons' => [self::button('Explore Hotel', '/hotel', 'hotel')],
                    'image_a' => self::img('hotel-exterior'),
                    'image_b' => self::img('hotel-room'),
                    'theme' => 'cream',
                ]],
                ['type' => 'csr_feature', 'content' => [
                    'label' => '04 — CSR',
                    'title' => 'Business with a Purpose.',
                    'lead' => 'Long-term commitment to the people and places around us — supporting schools, communities and a greener Sri Lanka.',
                    'buttons' => [self::button('View CSR Projects', '/csr')],
                    'image' => self::img('csr-books'),
                    'pillars' => [
                        ['icon' => 'users', 'title' => 'Community', 'text' => 'Standing with the neighbourhoods we serve'],
                        ['icon' => 'book', 'title' => 'Education', 'text' => 'Helping young people learn and grow'],
                        ['icon' => 'leaf', 'title' => 'Environment', 'text' => 'Caring for the land we travel across'],
                        ['icon' => 'hand', 'title' => 'Social Development', 'text' => 'Creating opportunity beyond business'],
                    ],
                ]],
                ['type' => 'featured_products', 'enabled' => false, 'content' => [
                    'label' => 'Featured parts', 'title' => 'Featured spare parts.',
                    'lead' => 'A selection of Tata and Leyland parts from our catalogue.', 'limit' => 4,
                ]],
                ['type' => 'gallery_preview', 'enabled' => false, 'content' => [
                    'label' => 'Gallery', 'title' => 'Moments from across the group.', 'limit' => 6, 'link_label' => 'View full gallery',
                ]],
                ['type' => 'stats', 'content' => [
                    'label' => 'Since 1967',
                    'title' => 'Decades of experience.',
                    'title_muted' => 'One commitment to quality.',
                    'lead' => 'From goods transportation in 1967 to motor spare parts and hospitality, the businesses have grown — but the commitment to providing the best service has stayed the same.',
                    'stats' => [
                        ['value' => '1967', 'label' => 'Established'],
                        ['value' => '{years}', 'suffix' => '+', 'label' => 'Years of heritage'],
                        ['value' => '4', 'label' => 'Business areas'],
                        ['value' => '3', 'label' => 'Locations · Colombo, Ambalantota, Tangalle'],
                    ],
                ]],
                ['type' => 'cta_band', 'content' => [
                    'label' => 'Get in touch',
                    'title' => 'Let’s move',
                    'title_muted' => 'forward together.',
                    'buttons' => [self::button('Contact Us', '/contact'), self::wa('WhatsApp Us', 'spare_parts')],
                ]],
            ],
        ];
    }

    private function about(): array
    {
        $numbered = 'number';

        return [
            'title' => 'About',
            'meta_title' => 'About G. Muthumala Group | Our Legacy & Heritage Since 1967',
            'meta_description' => 'From goods transportation in Tangalle in 1967 to motor spare parts and a three-star hotel — the journey, heritage and values of G. Muthumala Group of Companies.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'G. Muthumala Group of Companies',
                    'title' => 'A Legacy of Enterprise.',
                    'title_accent' => 'A Heritage of Excellence.',
                    'lead' => 'For more than five decades, G. Muthumala Group of Companies has been shaped by a simple yet enduring philosophy: build with integrity, serve with distinction, and grow with purpose.',
                    'image' => self::img('lorry'), 'art' => 'lorry',
                ]],
                ['type' => 'story_split', 'anchor' => 'story', 'content' => [
                    'label' => '01 — OUR STORY', 'label_style' => $numbered,
                    'title' => 'A family story that began in Tangalle in 1967.',
                    'lead' => 'What began in 1967 in Tangalle as a modest goods transportation venture has evolved into a diversified family enterprise with interests spanning Transportation, Motor Spare Parts, and Tourism.',
                    'body' => '<p>Through every chapter of our journey, one principle has remained constant: <strong>our commitment to providing the best service.</strong></p><p>Today the group — known in Sinhala as <em>Muthumala Motors Samuha Vyaparaya</em> — serves spare parts customers from its head office at No. 396, George R. de Silva Mawatha, Colombo 13, and its branch at No. 48, Main Street, Ambalantota, distributing recognised brands such as WABCO, Rane, Usha, Bimetal and Super Seal.</p>',
                    'image_a' => self::img('tipper'), 'art_a' => 'lorry',
                    'image_b' => self::img('parts'), 'art_b' => 'parts',
                    'media_label' => 'Then & now',
                ]],
                ['type' => 'journey', 'anchor' => 'journey', 'content' => [
                    'label' => '02 — OUR JOURNEY', 'label_style' => $numbered,
                    'title' => "Our journey\nsince 1967.",
                    'items' => [
                        [
                            'year' => '1967',
                            'title' => 'The Beginning of a Legacy',
                            'body' => '<p>In 1967, Mr. G. Muthumala laid the foundation of what would become the G. Muthumala Group of Companies.</p><p>Beginning in Tangalle, the business entered the goods transportation sector, hiring lorries to provide dependable transportation solutions. Driven by determination, discipline, and an entrepreneurial spirit, Mr. Muthumala established the foundations of a business built on Trust, Reliability, and Service.</p>',
                            'highlight' => 'From these humble beginnings emerged a vision that would extend far beyond Transportation.',
                        ],
                        [
                            'year' => '1980s',
                            'title' => 'Expanding Beyond Transportation',
                            'body' => '<p>The 1980s marked an important new chapter in the Group’s evolution.</p><p>Recognizing emerging opportunities within Sri Lanka’s growing automotive sector, the business expanded into the Importing and Distribution of Motor Spare Parts.</p><p>This strategic diversification transformed the Group from a transportation-focused enterprise into a broader business organization, while preserving the entrepreneurial spirit that had defined its beginnings.</p><p>It was a period that demonstrated an important characteristic of the Group’s heritage:</p>',
                            'highlight' => 'The ability to evolve without losing sight of its foundations.',
                        ],
                        [
                            'year' => '2016',
                            'title' => 'A New Chapter in Hospitality',
                            'body' => '<p>In 2016, the Group entered the tourism and hospitality sector, establishing a three-star hotel in Tangalle.</p><p>The move represented more than business diversification. It marked the continuation of the Group’s long-standing tradition of serving people — with the same dedication and attention to quality that had guided the business since its earliest days.</p><p>With tourism becoming an important part of the Group’s portfolio, the heritage of G. Muthumala continued to take on a new dimension.</p>',
                            'highlight' => 'From moving goods across the country to welcoming guests to the southern coast, service remained at the heart of the journey.',
                        ],
                        [
                            'year' => 'Today',
                            'title' => 'A Legacy That Continues',
                            'body' => '<p>Today, G. Muthumala Group of Companies stands as a diversified family-owned enterprise with interests across:</p><ul><li>Goods Transportation</li><li>Motor Spare Parts</li><li>Tourism &amp; Hospitality</li></ul><p>The Group’s continued journey is guided by the leadership of Mr. Asoka Muthumala, son of the founder, Mr. G. Muthumala.</p><p>Under the stewardship of the next generation, the Group continues to honour the principles established in 1967 while embracing new opportunities, evolving markets, and the possibilities of tomorrow.</p><p>The businesses may have expanded. The industries may have changed. But the foundation remains the same.</p>',
                            'highlight' => 'Integrity. Commitment. Service.',
                        ],
                    ],
                ]],
                ['type' => 'heritage', 'anchor' => 'heritage', 'content' => [
                    'label' => '03 — OUR HERITAGE', 'label_style' => $numbered,
                    'title' => 'Built by one generation.',
                    'title_muted' => 'Carried forward by another.',
                    'text' => "The story of G. Muthumala Group of Companies is ultimately a story of family, perseverance, and vision.\n\nFrom the first lorries hired in Tangalle to a diversified group spanning multiple industries, every chapter has been built upon the belief that lasting success is earned through trust, consistency, and an unwavering commitment to excellence.\n\nOur heritage is not defined solely by the businesses we have built. It is defined by the relationships we have earned, the standards we have maintained, and the values we continue to pass from one generation to the next.",
                    'year' => '1967',
                    'year_label' => 'Established · Tangalle',
                    'badge' => self::img('logo-emblem'),
                    'timeline_title' => 'The G. Muthumala Legacy',
                    'timeline' => self::legacyTimeline(),
                ]],
                ['type' => 'headline_split', 'anchor' => 'promise', 'content' => [
                    'label' => '04 — OUR PROMISE', 'label_style' => $numbered,
                    'lines' => ['Yesterday’s Values.', 'Today’s Excellence.', 'Tomorrow’s Vision.'],
                    'lead' => "More than five decades after its foundation, G. Muthumala Group of Companies continues to move forward with the same spirit that inspired its founder.\n\nWe honour our past. We uphold our values. We embrace the future.\n\nAnd above all, we remain committed to the principle that has defined our journey from the very beginning: providing the best service.",
                    'image_a' => self::img('road'), 'art_a' => 'fleet',
                    'image_b' => self::img('hotel-exterior'), 'art_b' => 'hotel',
                    'media_label' => 'Transportation · Spare Parts · Tourism',
                ]],
                ['type' => 'statements', 'anchor' => 'vision', 'content' => [
                    'title' => 'Vision and Mission',
                    'items' => [
                        ['label' => '05 — OUR VISION', 'text' => 'To be Sri Lanka’s most trusted partner in keeping commercial vehicles — and the businesses that depend on them — moving.'],
                        ['label' => '06 — OUR MISSION', 'anchor' => 'mission', 'text' => 'To supply quality Tata and Leyland spare parts island-wide, deliver reliable transportation and warm hospitality, and give back to the communities we serve — with the integrity our name has stood for since 1967.'],
                    ],
                ]],
                ['type' => 'numbered_cards', 'content' => [
                    'label' => '07 — OUR OBJECTIVES', 'label_style' => $numbered,
                    'title' => 'What we work towards.',
                    'lead' => 'Six commitments that shape how we grow.',
                    'items' => [
                        ['title' => 'Dependable parts supply', 'text' => 'Keep the right Tata and Leyland parts available island-wide, so vehicles spend less time off the road.'],
                        ['title' => 'Customer service', 'text' => 'Give every customer knowledgeable, honest advice — in person, by phone or on WhatsApp.'],
                        ['title' => 'Safe, reliable transport', 'text' => 'Operate well-maintained vehicles with safety and punctuality at the centre of every journey.'],
                        ['title' => 'Warm hospitality', 'text' => 'Welcome every guest with genuine Sri Lankan warmth, comfort and care.'],
                        ['title' => 'Our people', 'text' => 'Develop a skilled, motivated team and grow talent from within the group.'],
                        ['title' => 'Community impact', 'text' => 'Support education, community wellbeing and the environment wherever we operate.'],
                    ],
                ]],
                ['type' => 'chairman_message', 'anchor' => 'chairman', 'content' => [
                    'label' => '08 — CHAIRMAN’S MESSAGE',
                    'quote' => 'Since 1967, Muthumala has been built on one simple promise: to keep Sri Lanka’s commercial vehicles — and the people who depend on them — moving. That promise has carried us through generations of customers, partners and colleagues. As we have grown from goods transportation into spare parts and hospitality, our values have remained the same: honest service, genuine quality and respect for the communities we serve. Thank you for the trust you continue to place in us.',
                    'name' => 'Mr. Asoka Muthumala',
                    'role' => 'Chairman · G. Muthumala Group of Companies',
                ]],
                ['type' => 'values', 'content' => [
                    'label' => '09 — OUR VALUES', 'label_style' => $numbered,
                    'title' => 'What we stand for.',
                    'lead' => 'Six principles that guide how we work with customers, partners and each other.',
                    'items' => [
                        ['title' => 'Integrity', 'text' => 'Doing business honestly and keeping our word.'],
                        ['title' => 'Quality', 'text' => 'Supplying parts and services we stand behind.'],
                        ['title' => 'Customer Focus', 'text' => 'Understanding what keeps our customers’ vehicles and businesses running.'],
                        ['title' => 'Reliability', 'text' => 'Being there when a vehicle — or a guest — needs us.'],
                        ['title' => 'Innovation', 'text' => 'Bringing modern thinking to an established business.'],
                        ['title' => 'People', 'text' => 'Valuing our team and the communities around us.'],
                    ],
                ]],
                ['type' => 'link_rows', 'content' => [
                    'label' => '10 — OUR BUSINESS AREAS', 'label_style' => $numbered,
                    'title' => 'Explore the group.',
                    'items' => [
                        ['title' => 'Spare Parts', 'text' => 'Tata & Leyland commercial vehicle spare parts — our core business.', 'url' => '/spare-parts'],
                        ['title' => 'Transportation', 'text' => 'Where our story began in 1967 — buses, lorries and tippers.', 'url' => '/transportation'],
                        ['title' => 'Hotel', 'text' => 'A three-star hotel in Tangalle, since 2016.', 'url' => '/hotel'],
                        ['title' => 'CSR', 'text' => 'Creating value beyond business.', 'url' => '/csr'],
                    ],
                ]],
                ['type' => 'cta_band', 'content' => [
                    'label' => 'Established 1967 · Tangalle, Sri Lanka',
                    'title' => 'Providing', 'title_muted' => 'the best service.',
                    'buttons' => [self::button('Contact Us', '/contact'), self::button('Join our team', '/careers', 'ghost-light', icon: 'none')],
                ]],
            ],
        ];
    }

    private function spareParts(): array
    {
        $vehicleCard = fn (string $title, string $text, string $slug, string $image, string $art, string $linkLabel) => [
            'title' => $title, 'text' => $text, 'link_label' => $linkLabel,
            'url' => "/spare-parts?vehicle={$slug}#finder", 'image' => self::img($image), 'art' => $art,
        ];

        return [
            'title' => 'Spare Parts',
            'whatsapp' => 'spare_parts',
            'meta_title' => 'Tata & Leyland Spare Parts Sri Lanka | Lorry, Bus & Tipper Parts | Muthumala',
            'meta_description' => 'Tata and Leyland commercial vehicle spare parts in Sri Lanka for lorries, buses and tippers. Find your part or chat with the Muthumala spare parts team on WhatsApp.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Tata & Leyland · Commercial Vehicle Parts',
                    'title' => 'Keeping Sri Lanka’s Commercial Vehicles',
                    'title_accent' => 'Moving.',
                    'lead' => 'Tata & Leyland spare parts solutions for the vehicles that keep businesses moving.',
                    'buttons' => [self::button('Find your part', '#finder', icon: 'search'), self::button('Browse categories', '#categories', 'ghost-light', icon: 'none')],
                    'image' => self::img('parts'), 'art' => 'parts', 'size' => 'tall',
                ]],
                ['type' => 'business_cards', 'content' => [
                    'label' => 'Shop by vehicle',
                    'title' => "Three vehicle types.\nOne trusted source.",
                    'lead' => 'Start with your vehicle type — our team will help you identify the right part for your model.',
                    'cards' => [
                        $vehicleCard('Lorries', 'Commercial vehicle spare parts and components.', 'lorries', 'lorry', 'lorry', 'View lorry parts'),
                        $vehicleCard('Buses', 'Parts and components for passenger buses.', 'buses', 'bus', 'bus', 'View bus parts'),
                        $vehicleCard('Tippers', 'Heavy-duty parts for construction and haulage tippers.', 'tippers', 'tipper', 'tipper', 'View tipper parts'),
                    ],
                ]],
                ['type' => 'product_categories', 'anchor' => 'categories', 'content' => [
                    'label' => 'Part categories',
                    'title' => "Every system.\nEngine to body.",
                    'lead' => 'Browse by system. Select a category to send an enquiry to our spare parts team.',
                    'cta_title' => 'Can’t find your category?',
                    'cta_label' => 'Ask our team',
                    'cta_url' => '/contact?area=spare_parts#message',
                    'note' => 'Categories are shown for navigation. Stock availability for specific parts and models is confirmed by our team on enquiry.',
                ]],
                ['type' => 'product_catalogue', 'anchor' => 'products', 'content' => [
                    'label' => 'Catalogue',
                    'title' => 'Browse spare parts.',
                    'lead' => 'Search by part name or number, or filter by category, vehicle and brand.',
                    'limit' => 12,
                ]],
                ['type' => 'part_finder', 'anchor' => 'finder', 'content' => [
                    'label' => 'Find Your Part',
                    'title' => 'Tell us what you need.',
                    'lead' => 'Choose your vehicle and part — or enter a part number — and we’ll route your request straight to our spare parts desk.',
                    'checklist' => ['Tata & Leyland focus', 'Lorries, buses and tippers', 'Reply via WhatsApp or phone'],
                    'model_groups' => [
                        ['group' => 'Tata', 'models' => ['Tata LPT 709', 'Tata LPT 909', 'Tata LPT 1109', 'Tata LPT 1613', 'Tata LPK 2518 (tipper)']],
                        ['group' => 'Ashok Leyland', 'models' => ['Ashok Leyland Viking (bus)', 'Ashok Leyland Comet', 'Ashok Leyland Falcon', 'Ashok Leyland Tusker']],
                    ],
                ]],
                ['type' => 'brand_grid', 'content' => [
                    'label' => 'Brands we distribute',
                    'title' => "World-recognised names.\nImported and distributed by us.",
                    'lead' => 'Some of the trusted brands Muthumala imports and distributes for Tata and Leyland vehicles.',
                ]],
                ['type' => 'feature_grid', 'content' => [
                    'label' => 'Why Muthumala',
                    'title' => 'Why businesses choose us.',
                    'lead' => 'A spare parts partner rooted in commercial vehicles since 1967.',
                    'items' => [
                        ['icon' => 'shield', 'title' => 'Quality', 'text' => 'Recognised brands including WABCO, Rane, Usha, Bimetal and Super Seal.'],
                        ['icon' => 'stock', 'title' => 'Availability', 'text' => 'Island-wide distribution for Tata and Leyland vehicles, from Colombo and Ambalantota.'],
                        ['icon' => 'truck', 'title' => 'Commercial Vehicle Expertise', 'text' => 'We understand lorries, buses and tippers — and the businesses that rely on them.'],
                        ['icon' => 'headset', 'title' => 'Customer Support', 'text' => 'Talk to a real person by phone or WhatsApp to identify the right part.'],
                        ['icon' => 'award', 'title' => 'Industry Experience', 'text' => 'Importing and distributing motor spare parts since the 1980s — part of a family group founded in 1967.'],
                    ],
                    'columns' => '5', 'layout' => 'stacked', 'theme' => 'dark',
                ]],
                ['type' => 'cta_inline', 'content' => [
                    'label' => 'Spare Parts Desk',
                    'title' => 'Need a part today?',
                    'text' => 'Send a photo of the part or its number on WhatsApp, or call {phone_1}.',
                    'buttons' => [self::wa('Chat about Spare Parts', 'spare_parts'), self::button('Other enquiries', '/contact', 'ghost-light', icon: 'none')],
                    'theme' => 'navy',
                ]],
            ],
        ];
    }

    private function transportation(): array
    {
        $numbered = 'number';

        return [
            'title' => 'Transportation',
            'whatsapp' => 'transport',
            'meta_title' => 'Transportation Services Sri Lanka | Bus, Lorry & Tipper Fleet | Muthumala Group',
            'meta_description' => 'Goods transportation since 1967 — Muthumala Group’s bus, lorry and tipper services in Sri Lanka. Request a transport service or WhatsApp our transport desk.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Muthumala Transportation · Since 1967',
                    'title' => 'Transportation that keeps you',
                    'title_accent' => 'moving.',
                    'lead' => 'Goods transportation is where the G. Muthumala story began — with lorries hired in Tangalle in 1967.',
                    'buttons' => [self::button('Request Transport Service', '#enquiry'), self::button('Our fleet', '#fleet', 'ghost-light', icon: 'none')],
                    'image' => self::img('road'), 'art' => 'fleet',
                ]],
                ['type' => 'fleet_grid', 'anchor' => 'fleet', 'content' => [
                    'label' => '01 — OUR FLEET', 'label_style' => $numbered,
                    'title' => "On the road,\nevery day.",
                    'lead' => 'Buses, lorries and tippers serving passenger and commercial needs — maintained with the parts expertise behind our spare parts business.',
                ]],
                ['type' => 'service_grid', 'anchor' => 'services', 'content' => [
                    'label' => '02 — TRANSPORT SERVICES', 'label_style' => $numbered,
                    'title' => 'Services built around your load.',
                    'lead' => 'From daily passenger runs to heavy construction haulage.',
                ]],
                ['type' => 'feature_grid', 'anchor' => 'capabilities', 'content' => [
                    'label' => '03 — FLEET CAPABILITIES', 'label_style' => $numbered,
                    'title' => 'What you can expect.',
                    'lead' => 'What sets our transport services apart.',
                    'items' => [
                        ['icon' => 'shield', 'title' => 'Reliability', 'text' => 'Vehicles serviced with genuine parts, so they are ready when you need them.'],
                        ['icon' => 'check', 'title' => 'Safety', 'text' => 'Regular checks and careful driving on every route.'],
                        ['icon' => 'steer-wheel', 'title' => 'Professional Drivers', 'text' => 'Courteous drivers who know Sri Lanka’s roads.'],
                        ['icon' => 'route', 'title' => 'Fleet Management', 'text' => 'Planned maintenance backed by our own parts expertise.'],
                        ['icon' => 'calendar', 'title' => 'Flexible Services', 'text' => 'Daily, weekly or project-based hire, arranged around your schedule.'],
                    ],
                    'columns' => '2', 'layout' => 'split', 'theme' => 'light',
                ]],
                ['type' => 'transport_enquiry', 'anchor' => 'enquiry', 'content' => [
                    'label' => '04 — TRANSPORTATION ENQUIRY', 'label_style' => $numbered,
                    'title' => 'Request a transport service.',
                    'lead' => 'Tell us what you need to move, where and when. Our transport desk will get back to you.',
                    'buttons' => [self::wa('WhatsApp Transportation', 'transport')],
                ]],
            ],
        ];
    }

    private function hotel(): array
    {
        return [
            'title' => 'Hotel',
            'theme' => 'hotel',
            'whatsapp' => 'hotel',
            'meta_title' => 'Three-Star Hotel in Tangalle | Muthumala Hospitality, Sri Lanka',
            'meta_description' => 'Stay at Muthumala Hospitality, the group’s three-star hotel in Tangalle on Sri Lanka’s southern coast. Rooms, dining and reservations — book or WhatsApp the hotel.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Muthumala Hospitality · Tangalle',
                    'title' => 'Stay. Relax.',
                    'title_accent' => 'Experience.',
                    'buttons' => [self::button('Book Your Stay', '#reserve'), self::wa('WhatsApp Hotel', 'hotel', 'ghost-light')],
                    'image' => self::img('hotel-exterior'), 'art' => 'hotel',
                ]],
                ['type' => 'hotel_feature', 'content' => [
                    'label' => 'Welcome',
                    'title' => 'A quiet place to',
                    'title_accent' => 'arrive.',
                    'lead' => "A three-star hotel in Tangalle on Sri Lanka’s southern coast — a peaceful retreat for business travellers, families and weekend guests, where thoughtful service, comfortable rooms and good food come together.\n\nOpened in 2016 by a family enterprise that has served Sri Lanka since 1967 — from moving goods across the country to welcoming guests to the southern coast.",
                    'image_a' => self::img('hotel-beach'),
                    'image_b' => self::img('hotel-tray'),
                    'theme' => 'light',
                ]],
                ['type' => 'room_grid', 'anchor' => 'rooms', 'content' => [
                    'label' => 'Rooms & Accommodation',
                    'title' => 'Rest, beautifully.',
                    'lead' => 'Comfortable rooms for every kind of stay.',
                ]],
                ['type' => 'amenity_grid', 'anchor' => 'amenities', 'content' => [
                    'label' => 'Amenities',
                    'title' => 'Thoughtful comforts.',
                    'lead' => 'Everything you need for an easy, relaxed stay.',
                ]],
                ['type' => 'text_image', 'anchor' => 'dining', 'content' => [
                    'label' => 'Dining',
                    'title' => 'Dining,',
                    'title_accent' => 'served warmly.',
                    'lead' => 'From a hearty Sri Lankan breakfast to rice and curry and international dishes, our kitchen serves fresh, home-style food throughout the day.',
                    'buttons' => [self::button('Enquire about dining', '#reserve')],
                    'image' => self::img('hotel-dining'), 'art' => 'hotel',
                    'image_position' => 'left', 'theme' => 'dark',
                ]],
                ['type' => 'image_mosaic', 'content' => [
                    'label' => 'Gallery',
                    'title' => 'Moments at the hotel.',
                    'link_label' => 'View full gallery',
                    'link_url' => '/gallery?album=hotel',
                    'images' => [
                        ['image' => self::img('hotel-exterior'), 'art' => 'hotel'],
                        ['image' => self::img('hotel-beach'), 'art' => 'hotel'],
                        ['image' => self::img('hotel-dining'), 'art' => 'hotel'],
                        ['image' => self::img('hotel-kitchenette'), 'art' => 'hotel'],
                    ],
                ]],
                ['type' => 'hotel_reservation', 'anchor' => 'reserve', 'content' => [
                    'label' => 'Location & Reservations',
                    'title' => 'Book your stay.',
                    'note' => 'Reservations are handled through our Colombo head office',
                    'image' => self::img('hotel-beach'),
                    'buttons' => [self::wa('WhatsApp Hotel', 'hotel')],
                ]],
            ],
        ];
    }

    private function csr(): array
    {
        return [
            'title' => 'CSR Projects',
            'meta_title' => 'CSR Projects | Community, Education & Environment | Muthumala Group',
            'meta_description' => 'Muthumala Group’s corporate social responsibility — community development, education, environment and social initiatives in Sri Lanka.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Corporate Social Responsibility',
                    'title' => 'Creating Value',
                    'title_accent' => 'Beyond Business.',
                    'buttons' => [self::button('View projects', '#projects')],
                    'image' => self::img('csr-books'), 'art' => 'community',
                ]],
                ['type' => 'intro_split', 'content' => [
                    'label' => 'Our commitment',
                    'title' => 'Business with a Purpose.',
                    'lead' => 'For more than five decades our customers — drivers, operators and small business owners across Sri Lanka — have kept us moving. Giving back to their communities is how we say thank you, and how we help build a stronger Sri Lanka for the next generation.',
                    'accent' => 'csr',
                ]],
                ['type' => 'csr_focus_areas', 'content' => [
                    'label' => 'Focus areas',
                    'title' => 'Where we focus.',
                    'lead' => 'Six areas where we choose to make a difference.',
                ]],
                ['type' => 'project_grid', 'anchor' => 'projects', 'content' => [
                    'label' => 'Projects',
                    'title' => 'Our initiatives.',
                    'lead' => 'How we put our commitment into action.',
                    'limit' => 12,
                ]],
                ['type' => 'timeline', 'content' => [
                    'label' => 'Our CSR Journey',
                    'title' => 'A record of giving back.',
                    'items' => [
                        ['year' => 'Customers', 'text' => 'Five decades of serving drivers and operators island-wide.'],
                        ['year' => 'Communities', 'text' => 'Supporting schools and neighbourhoods around our branches.'],
                        ['year' => 'Environment', 'text' => 'Caring for the land and roads that connect Sri Lanka.'],
                        ['year' => 'Today', 'text' => 'Continuing our commitment to the communities we serve.'],
                    ],
                    'theme' => 'dark',
                ]],
                ['type' => 'cta_inline', 'content' => [
                    'title' => 'Partner with us on a community project.',
                    'text' => 'Have an idea that could make a difference? We’d like to hear it.',
                    'buttons' => [self::button('Get in touch', '/contact?area=csr#message')],
                    'theme' => 'csr',
                ]],
            ],
        ];
    }

    private function gallery(): array
    {
        return [
            'title' => 'Gallery',
            'meta_title' => 'Gallery | Muthumala Group of Companies',
            'meta_description' => 'Photo gallery of Muthumala Group — spare parts, transportation fleet, hotel, CSR projects and company moments.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Gallery',
                    'title' => 'Moments that',
                    'title_accent' => 'move us.',
                    'image' => self::img('road'), 'art' => 'fleet', 'size' => 'short',
                ]],
                ['type' => 'gallery', 'content' => ['title' => 'Image gallery']],
            ],
        ];
    }

    private function careers(): array
    {
        return [
            'title' => 'Careers',
            'meta_title' => 'Careers | Build Your Future With Muthumala Group, Sri Lanka',
            'meta_description' => 'Career opportunities at Muthumala Group of Companies across spare parts, transportation and hospitality in Sri Lanka. View open positions and apply online.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Careers',
                    'title' => 'Build Your Future',
                    'title_accent' => 'With Us.',
                    'buttons' => [self::button('View opportunities', '#openings')],
                    'image' => self::img('parts'), 'art' => 'parts', 'size' => 'short',
                ]],
                ['type' => 'feature_grid', 'content' => [
                    'label' => 'Why Join Us',
                    'title' => 'Grow with an established group.',
                    'items' => [
                        ['icon' => 'award', 'title' => 'Heritage since 1967', 'text' => 'Be part of a family enterprise that began in Tangalle in 1967.'],
                        ['icon' => 'trend', 'title' => 'Room to grow', 'text' => 'Work across spare parts, transportation and hospitality.'],
                        ['icon' => 'users', 'title' => 'People first', 'text' => 'On-the-job training and a supportive team that helps you learn and progress.'],
                    ],
                    'columns' => '3', 'layout' => 'stacked', 'theme' => 'light',
                ]],
                ['type' => 'image_mosaic', 'content' => [
                    'label' => 'Our Culture',
                    'title' => 'Hands-on. Dependable. Together.',
                    'lead' => 'We are a hands-on team that takes pride in solving problems for our customers — from finding the right part to getting a vehicle back on the road.',
                    'images' => [
                        ['image' => self::img('parts'), 'art' => 'parts'],
                        ['image' => self::img('road'), 'art' => 'fleet'],
                        ['image' => self::img('hotel-exterior'), 'art' => 'hotel'],
                        ['image' => self::img('csr-books'), 'art' => 'community'],
                    ],
                    'theme' => 'off',
                ]],
                ['type' => 'job_list', 'anchor' => 'openings', 'content' => [
                    'label' => 'Career Opportunities',
                    'title' => 'Open positions.',
                    'lead' => 'Send your CV for any of the roles below, or apply for future openings.',
                    'empty_text' => 'There are no open positions right now — send us your CV below and we will keep it on file.',
                ]],
                ['type' => 'application_form', 'anchor' => 'apply', 'content' => [
                    'label' => 'Apply',
                    'title' => 'Send us your application.',
                    'lead' => 'Don’t see the right role? Send your CV anyway — we’ll keep it on file for future openings.',
                ]],
            ],
        ];
    }

    private function contact(): array
    {
        return [
            'title' => 'Contact',
            'meta_title' => 'Contact Muthumala Group | Spare Parts, Transport & Hotel Enquiries',
            'meta_description' => 'Contact Muthumala Group of Companies in Sri Lanka — corporate office, spare parts, transportation and hotel enquiries by phone, email or WhatsApp.',
            'sections' => [
                ['type' => 'page_hero', 'content' => [
                    'label' => 'Contact Us',
                    'title' => 'Let’s Start a',
                    'title_accent' => 'Conversation.',
                    'image' => self::img('lorry'), 'art' => 'lorry', 'size' => 'short',
                ]],
                ['type' => 'contact_desks', 'content' => [
                    'label' => 'Direct lines',
                    'title' => 'Talk to the right team.',
                    'lead' => 'Each business has its own desk, so your enquiry reaches the people who can help.',
                    'desks' => [
                        ['title' => 'Spare Parts', 'whatsapp' => 'spare_parts', 'accent' => 'navy'],
                        ['title' => 'Transportation', 'whatsapp' => 'transport', 'accent' => 'blue'],
                        ['title' => 'Hotel', 'whatsapp' => 'hotel', 'accent' => 'hotel'],
                        ['title' => 'General', 'accent' => 'silver', 'button_label' => 'Send a message', 'button_url' => '#message'],
                    ],
                ]],
                ['type' => 'locations', 'content' => [
                    'label' => 'Our locations',
                    'title' => 'Visit us.',
                    'lead' => 'Tata & Leyland spare parts from Colombo to the south.',
                    'items' => [
                        ['label' => 'HEAD OFFICE', 'name' => 'Muthumala Motors — Colombo', 'address' => 'No. 396, George R. de Silva Mawatha, Colombo 13'],
                        ['label' => 'BRANCH', 'name' => 'Muthumala Motors — Ambalantota', 'address' => 'No. 48, Main Street, Ambalantota', 'phone_note' => 'Via head office:'],
                        ['label' => 'GROUP OUTLET', 'name' => 'Pavithra Traders — Tangalle', 'address' => 'Beliatta Road, Tangalle', 'phone_note' => 'Via head office:'],
                    ],
                ]],
                ['type' => 'contact_form', 'anchor' => 'message', 'content' => [
                    'label' => 'Corporate Office',
                    'title' => 'Send us a message.',
                    'hours' => 'Monday – Saturday · please call ahead to confirm times',
                ]],
                ['type' => 'map', 'content' => [
                    'title' => 'Map: Muthumala Motors, 396 George R. de Silva Mawatha, Colombo 13',
                ]],
            ],
        ];
    }
}
