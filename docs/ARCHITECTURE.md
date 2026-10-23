# Architecture

Two independently deployable applications:

```
frontend/   React 19 + Vite 8 + React Router 8 + Tailwind CSS 4   → public website and /admin CMS
backend/    Laravel 13 (PHP 8.3+) + MySQL 8                        → JSON API, media files, sitemap
```

The browser talks to the API only. In development Vite proxies `/api`, `/sanctum` and `/storage` to Laravel, so both share an origin. In production the SPA (e.g. `www.example.lk`) calls the API (e.g. `api.example.lk`) with CORS + credentials.

## Backend

```
app/
  Cms/            SectionRegistry (section types + fields), SettingsRegistry, SectionSchema
                  (validation rules, sanitising, media resolution), SectionDataResolver, Field, Icons
  Enums/          Role, Permission, BusinessArea, InquiryType/Status, ApplicationStatus, CareerStatus, EmploymentType, RoomStatus
  Http/
    Controllers/Api/         public endpoints
    Controllers/Api/Admin/   CMS endpoints; CrudController = shared list/show/store/update/destroy/reorder/toggle
    Requests/Public|Admin/   FormRequests (all validation)
    Resources/               API Resources (admin-only fields merged for /api/admin/*)
    Middleware/              Honeypot, EnsureActiveAdmin, SecurityHeaders
  Models/ + Concerns/        IsCmsContent (audit log + cache bust + scopes), LogsActivity, HasSlug, HasGallery
  Services/                  PageService, SettingsService, MediaService, ImageProcessor (GD → WebP),
                             InquiryService, NotificationService, HtmlSanitizer, ActivityLogger, MediaUsage
  Policies/UserPolicy.php
  Support/ContentCache.php   versioned public-API cache
```

### The section schema (single source of truth)

`app/Cms/SectionRegistry.php` declares every page-builder block: label, group, description, field list (`text`, `textarea`, `richtext`, `media`, `url`, `select`, `toggle`, `number`, `icon`, `tags`, `list`), and optionally a `data` source. That one definition:

1. is served to the admin (`GET /api/admin/section-types`), which renders the edit form generically;
2. becomes Laravel validation rules (`SectionSchema::rules`) — URLs pass the `SafeUrl` rule, selects/icons are whitelisted;
3. sanitises stored content (`SectionSchema::sanitize`) — unknown keys dropped, rich text cleaned with Symfony HtmlSanitizer;
4. resolves media ids into image payloads (with WebP `srcset`) when the page is served.

Settings use the same field format (`SettingsRegistry`), so the Settings screen uses the same form engine.

Each section type has a matching React component in `frontend/src/sections/` (registry in `sections/index.jsx`).

### Data model (MySQL)

| Area | Tables |
|---|---|
| Access | `users` (role_id, is_active, soft deletes), `roles`, `permissions`, `permission_role`, `sessions`, `password_reset_tokens` |
| Site | `settings` (key → JSON value, public flag), `social_links`, `pages`, `page_sections` (type, JSON content, order, enabled), `activity_logs` |
| Media | `media` (path, mime, size, dimensions, alt/title/caption, WebP variants), `mediables` (ordered galleries for any model) |
| Spare parts | `products` (soft deletes), `product_categories`, `vehicle_types`, `brands`, `product_vehicle_type` |
| Transport | `transportation_services`, `fleet_items` |
| Hotel | `hotel_rooms`, `hotel_amenities`, `hotel_amenity_hotel_room` |
| Gallery | `gallery_albums`, `gallery_images` |
| CSR | `csr_categories`, `csr_projects` |
| Careers | `careers`, `job_applications` (CV path on the private disk) |
| Inquiries | `contact_inquiries` (type, business area, status, JSON meta for form-specific fields) |

Foreign keys everywhere (`nullOnDelete` for optional media/taxonomy links, `cascadeOnDelete` for pivots), indexes on status/area/order/date columns, soft deletes on content people may want back (products, rooms, fleet, services, CSR projects, jobs, inquiries, users). Job applications are deleted permanently (personal data + CV file).

### API

Public (rate limited 120/min): `GET /api/site`, `/pages`, `/pages/{slug}`, `/products`, `/products/filters`, `/products/{slug}`, `/transportation`, `/hotel`, `/gallery`, `/csr`, `/csr/{slug}`, `/careers`, `/careers/{slug}`; `GET /sitemap.xml`.

Forms (5/min and 30/hour per IP, honeypot): `POST /api/contact`, `/transport-requests`, `/hotel-reservations`, `/part-requests`, `/careers/apply`.

Admin (`auth:sanctum` + active-admin check + per-area `can:` permission): auth/profile, dashboard, meta, media, pages + sections, the content modules (`index/show/store/update/destroy` + `reorder` + `toggle`), gallery bulk add, inquiries (+ CSV export), applications (+ CV download), settings (+ social links), users/roles, activity log. Full list: `php artisan route:list --path=api`.

A whole public page is one request: `PageService` loads enabled sections, resolves all referenced media in one query and attaches live data (products, rooms, jobs…) for data-driven sections. Responses are cached with a version key that every content write bumps (`ContentCache`), so edits appear immediately without cache tags.

### Authentication & authorisation

- Sanctum SPA cookie sessions (CSRF-protected), "remember me", session regeneration on login, invalidation on logout, encrypted sessions, password reset via emailed link to `/admin/reset-password`.
- Roles → permissions (seeded from `App\Enums\Role`). Every permission is a Gate ability; route groups use `can:<permission>`. Super Admin has all. `UserPolicy` prevents self-deletion and removing/demoting the last active Super Admin. `EnsureActiveAdmin` ends sessions of deactivated users immediately.
- The React admin hides what a user cannot do, but every check is enforced by the API.

### Media

Uploads are validated by content (MIME sniffing) and size, stored on the `public` disk under `media/YYYY/MM/` with random suffixes, and resized by GD into WebP `thumb` (480), `medium` (1200) and `large` (2000) variants — never upscaled. SVG is not accepted (XSS risk). Replacing a file keeps its id, so every page using it updates. CVs go to the private `local` disk and are only streamed to users with `manage_applications`.

### Security summary

Validation on every input (FormRequests), Eloquent bindings (no raw SQL with input), output escaping by React, rich text sanitised server-side, URL fields restricted to safe schemes, CSRF via Sanctum, rate limits on forms and login, honeypot, private CV storage, CSV-injection guard on export, security headers (`nosniff`, `DENY` framing, referrer policy, HSTS on HTTPS), `no-store` on admin responses, generic error messages with `APP_DEBUG=false`, secrets only in `.env` (never in the frontend bundle).

## Frontend

```
src/
  styles/app.css          Tailwind v4 @theme tokens, custom utilities, small component layer
  lib/                    api client (CSRF, errors), formatting helpers
  contexts/SiteContext    settings, WhatsApp link builder
  hooks/                  useApi (cached GET), useForm, useSeo, usePageChrome/useHashScroll, useScrolled
  components/common|layout|forms
  sections/               one component per CMS section type + registry
  pages/                  CmsPage (any CMS page), detail pages, error/maintenance pages
  layouts/PublicLayout
  admin/                  lazy-loaded CMS: auth, layout, SchemaForm, ResourceManager, media picker, pages
```

- **Styling**: Tailwind CSS v4 utilities throughout; the prototype's tokens are Tailwind theme values (`bg-navy-950`, `text-h2`, `py-section`, `ease-brand`), breakpoints match the prototype, and a `hotel:` custom variant applies the hospitality theme.
- **Code splitting**: the admin (≈110 KB) and the rich-text editor (TipTap, loaded only when a rich-text field opens) are separate chunks; the public site never downloads them.
- **SEO**: per-page title/description/canonical/Open Graph/Twitter tags from the CMS, JSON-LD Organization data, `sitemap.xml` from the API, build-time `robots.txt`. As a client-rendered SPA, search engines that execute JavaScript (Google, Bing) see the full content; `index.html` carries sensible defaults for those that don't. Pre-rendering can be added later without API changes.
- **Accessibility**: skip links, landmarks, one `h1` per page, labelled controls with `aria-invalid`/described errors, keyboard-operable menus, native `<dialog>` modals and lightbox, visible focus outlines, `prefers-reduced-motion` respected, WhatsApp/new-tab links announced.

## Decisions and trade-offs

- **Custom roles/permissions** instead of a package: three roles and 13 permissions defined in enums; simple and dependency-free.
- **GD for images** instead of an image library: resize + WebP is all that is needed.
- **One generic CRUD controller and one generic admin ResourceManager**: twelve content modules share behaviour; each module is a small declaration.
- **No booking engine**: the hotel takes reservation *requests*, as in the prototype.
- **Page builder without drag-and-drop**: sections are added from a catalogue, edited in forms, ordered with up/down controls, toggled on/off — reliable and accessible.
