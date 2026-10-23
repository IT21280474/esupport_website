# Muthumala Group — API (Laravel 13)

JSON API, media storage and authentication for the Muthumala Group website and CMS.

See the [project README](../README.md) for setup and deployment, and [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for the data model, API and CMS schema.

```bash
composer install && cp .env.example .env && php artisan key:generate
php artisan migrate --seed && php artisan storage:link
php artisan serve
php artisan test
```
