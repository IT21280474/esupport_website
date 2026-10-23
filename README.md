# Muthumala Group of Companies — Website & CMS

Corporate website for Muthumala Group of Companies (est. 1967) — Tata & Leyland commercial vehicle spare parts, transportation, hospitality and CSR — with a custom content-management system.

| | |
|---|---|
| `frontend/` | React 19 · Vite 8 · React Router 8 · Tailwind CSS 4 — public website and the `/admin` CMS |
| `backend/` | Laravel 13 · MySQL 8 — JSON API, media storage, authentication, sitemap |
| `docs/AUDIT.md` | Inventory of the HTML prototype and how each part maps to the build |
| `docs/ARCHITECTURE.md` | Data model, API, CMS schema, security and design decisions |

The design is a faithful port of the approved prototype (`muthumala-group_15.html`). Every page is built from CMS sections, so text, images, buttons, order and visibility can be changed in the admin panel without touching code.

---

## Requirements

- PHP **8.3+** with `gd` (WebP support), `fileinfo`, `pdo_mysql`, `mbstring`, `openssl`
- Composer 2
- MySQL 8 (or MariaDB 10.6+)
- Node.js **22.22+** and npm

## Local setup

### 1. Backend (API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```dotenv
DB_DATABASE=muthumala_group
DB_USERNAME=your_user
DB_PASSWORD=your_password

ADMIN_EMAIL=you@example.com     # first Super Admin
ADMIN_PASSWORD=                 # leave empty to have one generated and printed
```

Create the database, then:

```bash
php artisan migrate --seed      # schema + roles + admin + all prototype content and images
php artisan storage:link        # public URLs for uploaded media
php artisan serve               # http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # defaults work for local development
npm run dev                     # http://localhost:5173
```

Open **http://localhost:5173** for the website and **http://localhost:5173/admin** for the CMS. In development Vite proxies `/api`, `/sanctum` and `/storage` to Laravel, so no CORS setup is needed.

### Useful commands

| Command | Where | What |
|---|---|---|
| `php artisan migrate:fresh --seed` | backend | Rebuild the database with seed content (destroys data) |
| `php artisan db:seed` | backend | Safe to re-run — each seeder skips data that already exists |
| `php artisan test` | backend | Feature/API tests |
| `npm test` | frontend | Component tests (Vitest) |
| `npm run lint` | frontend | Lint (oxlint) |
| `npm run build` | frontend | Production build to `frontend/dist` |

---

## Admin panel

Sign in at `/admin` with the account created by the seeder. Change its password under **Profile** after the first sign-in.

| Role | Can manage |
|---|---|
| Super Admin | Everything, including settings, admin users and the activity log |
| Content Manager | Pages, media, gallery, spare parts, transportation, hotel, CSR, careers |
| Inquiry Manager | Contact inquiries and job applications |

What lives where:

- **Pages** — every page is a list of sections. Edit text and images, add sections from the catalogue, switch them on/off, reorder, duplicate. Page settings hold the SEO title/description, sharing image, theme (corporate or hotel) and floating WhatsApp button.
- **Media library** — uploads are resized to WebP automatically. *Replace file* swaps an image everywhere it is used; *Used in* shows where.
- **Spare parts / Transportation / Hotel / CSR / Careers** — the records behind the live lists (products, fleet, rooms, projects, jobs…).
- **Inquiries / Applications** — everything sent through the website, with status, notes, CSV export and private CV download.
- **Settings** — company details, phone numbers, email, address, **WhatsApp numbers per desk**, navigation menus, SEO defaults, maintenance mode, map, notification emails and social links.

In section text you can write `{phone_1}`, `{phone_2}`, `{phone_3}`, `{email}` or `{years}` to insert live values from Settings.

---

## Before launch — content to confirm with the client

The seed content comes only from the prototype and the verified brief; nothing was invented. These items still need the client's input (the admin dashboard shows a checklist):

- [ ] **WhatsApp numbers** — the general desk uses the company mobile **0716884650**; confirm it is on WhatsApp and add numbers for the Spare Parts, Transport and Hotel desks (Settings → WhatsApp).
- [ ] **Photographs** — the bundled photos are the prototype's illustrative images; replace them with real photos (Media library → Replace file).
- [ ] **Chairman's message** — confirm the wording, name and add a portrait (Pages → About).
- [ ] **Job openings** — the three jobs from the prototype are published; confirm or set them to Draft/Closed (Careers).
- [ ] **Hotel** — confirm room types; add prices only if they should be public.
- [ ] **CSR projects** — add verified dates, locations and photos.
- [ ] **Products** — add real Tata/Leyland parts; the catalogue section appears automatically once products exist.
- [ ] **Brand logos** — only with each brand owner's permission.
- [ ] **Social media** — only Facebook is known; add others in Settings → Social media.
- [ ] **Privacy policy** — the forms collect personal data and CVs; publish a privacy notice and link it in Settings → Navigation.
- [ ] **Notification recipients** — set who receives inquiry/application emails (Settings → Notifications) and configure the mail server.

Note: the prototype listed +94 11 238 4227 and muthumalasales@gmail.com; the site uses the verified numbers **0112384237 / 0716884650 / 0716884649** and **gmuthumalamotors@gmail.com** from the client brief.

---

## Deployment

The two apps deploy independently. For admin sign-in to work in production, **the website and the API must share a parent domain** (for example `www.muthumala.lk` and `api.muthumala.lk`), because the admin uses secure session cookies.

### Backend — cPanel or VPS

1. Upload `backend/` (outside `public_html` if possible) and point the API sub-domain's document root to `backend/public`.
2. `composer install --no-dev --optimize-autoloader`
3. Create `.env` from `.env.example` with production values:

   ```dotenv
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.muthumala.lk
   FRONTEND_URL=https://www.muthumala.lk
   CORS_ALLOWED_ORIGINS=https://www.muthumala.lk,https://muthumala.lk

   SESSION_DOMAIN=.muthumala.lk
   SESSION_SECURE_COOKIE=true
   SANCTUM_STATEFUL_DOMAINS=www.muthumala.lk,muthumala.lk

   MAIL_MAILER=smtp
   MAIL_HOST=…  MAIL_PORT=587  MAIL_USERNAME=…  MAIL_PASSWORD=…
   MAIL_FROM_ADDRESS=no-reply@muthumala.lk
   ```

4. Run:

   ```bash
   php artisan key:generate        # first deploy only
   php artisan migrate --force
   php artisan db:seed --force     # first deploy only
   php artisan storage:link
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```

5. Make `storage/` and `bootstrap/cache/` writable by the web server. No queue worker or cron is required (mail is sent after the response).

### Frontend — Vercel (or any static host)

1. Import the repository in Vercel with **Root Directory** `frontend`, build command `npm run build`, output `dist`.
2. Environment variables:

   ```dotenv
   VITE_API_URL=https://api.muthumala.lk
   VITE_SITE_URL=https://www.muthumala.lk
   ```

3. In `frontend/vercel.json`, change the `/sitemap.xml` rewrite destination to `https://api.muthumala.lk/sitemap.xml`.

For Apache/cPanel static hosting instead, upload the contents of `frontend/dist` — the included `.htaccess` handles client-side routes.

### After deploying

- Sign in to `/admin`, change the admin password, work through the launch checklist.
- Submit `https://www.muthumala.lk/sitemap.xml` in Google Search Console.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Admin sign-in returns 419 or loops back to login | `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` and `SESSION_SECURE_COOKIE` must match the live domains; site and API must share a parent domain. |
| Browser shows a CORS error | Add the site's exact origin (scheme + host) to `CORS_ALLOWED_ORIGINS` and run `php artisan config:cache`. |
| Images don't load | Run `php artisan storage:link`; check `APP_URL` is the public API URL. |
| Changes to `.env` have no effect | `php artisan config:cache` (or `config:clear`). |
| Emails not arriving | Check `MAIL_*` settings and Settings → Notifications; failures are written to `storage/logs/laravel.log`. |
