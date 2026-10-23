# Prototype audit — `muthumala-group_15.html`

Phase 1 of the build: what the single-file HTML prototype contains, and where each part lives in the production application.

The prototype is a hash-routed single page (`#/about`, `#/spare-parts`…) with all CSS, JS and 26 images (base64) inline. It is the design and content source of truth.

## 1. Pages and routes

| Prototype route | Production URL | CMS page slug | Notes |
|---|---|---|---|
| `#/index` | `/` | `home` | |
| `#/about` | `/about` | `about` | anchors `#story`, `#vision`, `#mission`, `#chairman` |
| `#/spare-parts` | `/spare-parts` | `spare-parts` | anchors `#categories`, `#finder`, new `#products` |
| `#/transportation` | `/transportation` | `transportation` | anchors `#fleet`, `#enquiry` |
| `#/hotel` | `/hotel` | `hotel` | hotel theme (cream, serif); anchors `#rooms`, `#amenities`, `#dining`, `#reserve` |
| `#/csr` | `/csr` | `csr` | anchor `#projects` |
| `#/gallery` | `/gallery` | `gallery` | `?album=` filter |
| `#/careers` | `/careers` | `careers` | anchors `#openings`, `#apply` |
| `#/contact` | `/contact` | `contact` | `?area=` pre-selects the business area; anchor `#message` |
| — | `/spare-parts/{slug}` | — | new: product detail |
| — | `/careers/{slug}` | — | new: job detail |
| — | `/csr/{slug}` | — | new: CSR project detail |
| — | `/admin/*` | — | new: CMS |

## 2. Sections (→ CMS section type)

**Home** — fleet hero with facts bar (`home_hero`) · heritage statement, 1967 badge and timeline (`heritage`) · four business cards (`business_cards`) · dark spare-parts feature with chips (`parts_feature`) · three vehicle cards (`vehicle_cards`) · vehicle panels with parallax + marquee (`mobility`) · logo tiles of the brands we distribute, logo brands only (`brand_grid`, brands managed under Spare Parts → Brands) · stacked headline + overlapping photos (`headline_split`) · hospitality feature (`hotel_feature`) · CSR band + four pillars (`csr_feature`) · statistics (`stats`) · CTA band (`cta_band`). Added, hidden by default: featured products, featured gallery.

**About** — page hero (legacy tagline) · story + overlapping images (`story_split`) · year-by-year journey chapters 1967 · 1980s · 2016 · Today (`journey`) · heritage statement, 1967 badge and legacy timeline (`heritage`) · our promise, three-line headline (`headline_split`) · vision/mission (`statements`) · six objectives (`numbered_cards`) · chairman's message with emblem (`chairman_message`) · six values (`values`) · business-area rows (`link_rows`) · CTA band. History copy from the client's HISTORY 1.docx.

**Spare Parts** — tall hero · shop-by-vehicle cards (`business_cards`) · 13 category tiles + "can't find" tile + note (`product_categories`) · part finder (`part_finder`) · brands (`brand_grid`) · why-us, 5 columns dark (`feature_grid`) · spare-parts desk CTA (`cta_inline`). Added: searchable catalogue (`product_catalogue`), shown once products exist.

**Transportation** — hero · fleet mosaic (`fleet_grid`) · three services (`service_grid`) · capabilities beside heading (`feature_grid`, split) · request form + WhatsApp (`transport_enquiry`).

**Hotel** — hero · welcome (`hotel_feature`) · rooms (`room_grid`) · amenities (`amenity_grid`) · dining (`text_image`, dark) · photo mosaic (`image_mosaic`) · reservation details + form (`hotel_reservation`).

**CSR** — hero · intro (`intro_split`) · six focus areas (`csr_focus_areas`) · projects (`project_grid`) · CSR journey timeline (`timeline`) · partner CTA (`cta_inline`, green).

**Gallery** — short hero · filterable masonry + lightbox (`gallery`).

**Careers** — short hero · why join (`feature_grid`) · culture mosaic (`image_mosaic`) · open positions (`job_list`) · application form with CV upload (`application_form`).

**Contact** — short hero · four desks (`contact_desks`) · three locations (`locations`) · office details + form (`contact_form`) · Google map (`map`).

Generic blocks added for future pages: `rich_text`, `faq`, `testimonials`.

## 3. Reusable components

Header (transparent → solid on scroll; cream on the hotel page) · mobile menu (clip-path wipe, numbered links) · brand lockup (circular logo on white disc) · buttons (sweep-fill hover; navy, white, ghost, ghost-light, gold, WhatsApp, hotel) · link-arrow · eyebrow / numbered labels · section header (title left, lead right) · media figure with art-directed placeholder · chips · timeline · pillar card · info list · contact card · floating WhatsApp (bottom dock on phones) · lightbox (`<dialog>`) · footer with outline wordmark.

## 4. Design tokens

Navy 950–100, off-white and greys, silver, restrained gold; hotel sub-palette (cream, umber, bronze); CSR green; WhatsApp green. Fonts: Plus Jakarta Sans, IBM Plex Mono, Cormorant Garamond (hotel). Fluid type scale (`--fs-display` … `--fs-label`), gutter and section spacing, 2px/6px radii, two shadows, easing `cubic-bezier(.2,.7,.1,1)`. All ported to Tailwind v4 `@theme` in `frontend/src/styles/app.css`.

## 5. Responsive behaviour

Desktop-first breakpoints 1440 · 1200 · 1024 · 768 · 480 · 390, plus 1025–1360 header compaction. Ported as Tailwind breakpoints `xs 391 · sm 481 · md 769 · lg 1025 · xl 1201 · 2xl 1440`. Mobile nav below 1025px; hero line-up widens and crops on phones; most grids step 4 → 2 → 1; WhatsApp becomes a full-width bottom dock under 481px.

## 6. Animations

Fade-up reveal on scroll · clip reveal on photos · timeline line draw · year counter · hero zoom and fleet fade-in · scanning lines · scroll cue · infinite marquee · WhatsApp pulse ring · card hover lifts/zooms · light parallax on vehicle panels (desktop pointers only). All disabled under `prefers-reduced-motion`.

## 7. Forms (prototype → production)

| Form | Prototype | Production endpoint |
|---|---|---|
| Part finder | WhatsApp link only | catalogue search + WhatsApp + callback → `POST /api/part-requests` |
| Transport request | front-end only | `POST /api/transport-requests` |
| Hotel reservation | front-end only | `POST /api/hotel-reservations` |
| Job application + CV | front-end only | `POST /api/careers/apply` (multipart, private storage) |
| Contact | front-end only | `POST /api/contact` |

## 8. Assets

Logo (circular emblem, 301 px) and the client's official logo file; hero fleet line-up (2400×907); 15 photographs (lorry, buses, tipper, road, parts, hotel exterior/rooms/dining/details, CSR books). The prototype calls these "embedded AI imagery" — they are illustrative and should be replaced with real photographs. Seven line-art SVG placeholders (lorry, bus, tipper, parts, fleet, hotel, community). Some prototype sections hot-linked Unsplash stock photos; those were **not** carried over (they would misrepresent the company) — the local images or the placeholder art are used instead.

## 9. Content found in the prototype that differs from the verified brief

| Item | Prototype | Verified (client brief) — used |
|---|---|---|
| Phone | +94 11 238 4227 | 0112384237, 0716884650, 0716884649 |
| Email | muthumalasales@gmail.com | gmuthumalamotors@gmail.com |
| WhatsApp numbers | placeholders | general desk defaults to 0716884650 — **to confirm** |

## 10. Placeholder / unverified content (kept, flagged for review)

Chairman's message (no name or portrait) · three job openings · room types (no prices) · CSR projects (no dates, locations or figures) · vehicle model list in the part finder · brand list (text only, no logos without permission) · "Benefit statements to be confirmed by HR" note (removed from the public page). No products, prices, specifications, statistics or social links were invented; only the Facebook URL present in the prototype is configured.
