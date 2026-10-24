<?php

namespace App\Support\Content;

use App\Models\ContentRevision;
use App\Models\ContentSection;
use App\Models\User;
use App\RevisionStatus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Reads and writes website content: stored sections merged over the bundled defaults.
 */
class ContentRepository
{
    public const CACHE_KEY = 'site-content';

    private const REVISIONS_KEPT = 50;

    public function __construct(
        private ContentSchema $schema,
        private ContentSanitizer $sanitizer,
    ) {}

    /**
     * The full site content, as the public website consumes it.
     *
     * @return array<string, array<string, mixed>>
     */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            $content = $this->schema->allDefaults();
            $stored = ContentSection::query()->pluck('data', 'key');

            foreach ($stored as $key => $data) {
                if (isset($content[$key]) && is_array($data)) {
                    /* Shallow merge so fields added to the schema later still get their default. */
                    $content[$key] = array_merge($content[$key], $data);
                }
            }

            return $content;
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function get(string $key): array
    {
        return $this->all()[$key];
    }

    /**
     * Validates and publishes a section, keeping a revision for history/restore.
     *
     * @return array<string, mixed>
     */
    public function save(string $key, mixed $input, User $user): array
    {
        $clean = $this->sanitizer->sanitizeSection($key, $input);

        DB::transaction(function () use ($key, $clean, $user): void {
            ContentSection::query()->updateOrCreate(['key' => $key], ['data' => $clean, 'updated_by' => $user->id]);
            ContentRevision::query()->create(['section_key' => $key, 'data' => $clean, 'user_id' => $user->id]);
            $this->pruneHistory($key);
        });

        $this->flush();

        return $clean;
    }

    /**
     * Validates a section and holds it for an admin to approve; the live site is untouched.
     * Each user has at most one pending version per section, which later submissions replace.
     */
    public function submit(string $key, mixed $input, User $user): ContentRevision
    {
        $clean = $this->sanitizer->sanitizeSection($key, $input);

        $revision = ContentRevision::query()->firstOrNew([
            'section_key' => $key,
            'user_id' => $user->id,
            'status' => RevisionStatus::Pending,
        ]);

        $revision->fill([
            'data' => $clean,
            'base_updated_at' => ContentSection::query()->where('key', $key)->value('updated_at'),
        ])->save();

        return $revision;
    }

    /**
     * The user's own unpublished version of a section: pending, or rejected and not yet resubmitted.
     */
    public function draftFor(string $key, User $user): ?ContentRevision
    {
        $latest = ContentRevision::query()->with('reviewer:id,name')
            ->where('section_key', $key)
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        return $latest !== null && $latest->status !== RevisionStatus::Approved ? $latest : null;
    }

    /**
     * Publishes a pending version (re-validated against the current schema).
     *
     * @return array<string, mixed>
     */
    public function approve(ContentRevision $revision, User $admin): array
    {
        $key = $revision->section_key;
        $clean = $this->sanitizer->sanitizeSection($key, $revision->data);

        DB::transaction(function () use ($key, $clean, $revision, $admin): void {
            ContentSection::query()->updateOrCreate(['key' => $key], ['data' => $clean, 'updated_by' => $revision->user_id ?? $admin->id]);
            $revision->update([
                'data' => $clean,
                'status' => RevisionStatus::Approved,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);
            $this->pruneHistory($key);
        });

        $this->flush();

        return $clean;
    }

    public function reject(ContentRevision $revision, User $admin, ?string $note): void
    {
        $revision->update([
            'status' => RevisionStatus::Rejected,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'review_note' => $note,
        ]);
    }

    /**
     * Whether the live section changed after the editor started from it.
     */
    public function isStale(ContentRevision $revision): bool
    {
        $live = ContentSection::query()->where('key', $revision->section_key)->value('updated_at');

        if ($live === null) {
            /* The section was reset to defaults after the editor started. */
            return $revision->base_updated_at !== null;
        }

        return $revision->base_updated_at === null || $revision->base_updated_at->lt($live);
    }

    /**
     * Keeps the newest published versions; pending and rejected ones are never pruned here.
     */
    private function pruneHistory(string $key): void
    {
        $keep = ContentRevision::query()->published()->where('section_key', $key)->limit(self::REVISIONS_KEPT)->pluck('id');
        ContentRevision::query()->where('section_key', $key)
            ->where('status', RevisionStatus::Approved)
            ->whereNotIn('id', $keep)
            ->delete();
    }

    public function reset(string $key): void
    {
        ContentSection::query()->where('key', $key)->delete();
        $this->flush();
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
        $this->notifyWebsite();
    }

    /**
     * Ask the Next.js website to drop its cached pages. Failures are logged, never fatal:
     * the website also refreshes on its own every few minutes.
     */
    private function notifyWebsite(): void
    {
        $url = config('services.website.revalidate_url');
        $secret = config('services.website.revalidate_secret');

        if (! $url || ! $secret) {
            return;
        }

        try {
            Http::timeout(3)->withHeaders(['X-Revalidate-Secret' => $secret])->post($url)->throw();
        } catch (Throwable $exception) {
            Log::warning('Website revalidation failed: '.$exception->getMessage());
        }
    }
}
