# eSupport Website

The eSupport Technologies website (Next.js 16). Content is managed from a multi-user admin panel at `/admin`, backed by the **Laravel API + MySQL** project in `../esupport_api`.

```
Browser ──► Next.js (this app) ──► Laravel API (esupport_api) ──► MySQL
            • public website         • auth (Sanctum tokens), roles
            • admin panel UI         • content, revisions, media, leads, activity
```

## Running locally

Start the API first, then the website:

```bash
# 1. Laravel API (in ../esupport_api)
composer install
cp .env.example .env          # set DB_* for your MySQL, then:
php artisan key:generate
php artisan migrate --seed    # prints the first admin login, loads the saved content and its images
php artisan serve             # http://127.0.0.1:8000

# 2. Website (this folder)
npm install
npm run dev                   # http://localhost:3000, admin at /admin
```

`.env.local` (website):

| Variable | Purpose |
| --- | --- |
| `LARAVEL_API_URL` | Laravel base URL (default `http://127.0.0.1:8000`). |
| `REVALIDATE_SECRET` | Shared with Laravel's `WEBSITE_REVALIDATE_SECRET`. Laravel calls `/api/revalidate` after content changes so cached pages refresh at once. |

On the Laravel side, `WEBSITE_REVALIDATE_URL` must point at this site's `/api/revalidate`.

## Admin panel

- **Content:** one editor per section, generated from the schema Laravel serves (`esupport_api/resources/content/schema.json`). Laravel also validates every save against that schema.
- **History:** the last 50 versions of each section, with restore. Admins can reset a section to its defaults.
- **Media library:** uploads are converted to WebP by Laravel and served at `/uploads/*`, which this app proxies to the API. "Capture from URL" screenshots live sites (needs Chrome on the API server).
- **Inbox:** "Get Started" form submissions, with CSV export.
- **Users & roles:** **Admin** has full access. **Editor** can edit content, media and the inbox, but not manage users.
- **Activity log:** who changed what.

The Sanctum token is kept in an httpOnly cookie. The browser never talks to the API directly; server actions and route handlers in `app/admin` and `app/api` call it.

## Changing what's editable

1. Add the field to `esupport_api/resources/content/schema.json` and its default to `defaults.json`.
2. Add it to `lib/content/types.ts` and render it in the matching component under `app/components`.

## Deployment

- Run the Laravel API (PHP 8.3+, MySQL 8) and this Next.js app as long-running Node processes, ideally on the same server.
- Back up the MySQL database and `esupport_api/storage/app/public/uploads`.
- `next build` fetches content from the API, so the API must be reachable during the build.
- Serve both over HTTPS in production.

### Loading the saved content and images on a server

The content edited in the admin panel lives in the database, and uploaded images in `storage/app/public/uploads`; neither is in git, so a new server shows the bundled defaults. `ContentSeeder` loads a saved copy of the Hero, Navigation and Portfolio sections and their images from `esupport_api/database/seeders/content/`:

```bash
php artisan db:seed --class=ContentSeeder --force
```

It is safe to run again: images are only copied when missing, and a section that already has content is left alone. To replace those sections too, run it with `SEED_OVERWRITE_CONTENT=true`; the replaced version stays in the section's History in the admin panel. After seeding on a live server, the API and website pick the content up straight away (the API clears its content cache and asks the website to refresh).

## Portfolio screenshots (bulk)

`node scripts/capture-portfolio.mjs` re-captures the bundled previews in `public/portfolio/` from `app/data/portfolio.ts`.
