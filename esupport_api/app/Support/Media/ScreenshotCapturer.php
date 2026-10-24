<?php

namespace App\Support\Media;

use App\Models\Media;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

/**
 * Screenshots a live website with headless Chrome for portfolio previews.
 */
class ScreenshotCapturer
{
    private const BROWSERS = [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ];

    public function __construct(private ImageStore $images) {}

    public function capture(string $url, ?User $user): Media
    {
        $browser = $this->findBrowser();
        if ($browser === null) {
            throw new MediaException("Chrome isn't installed on the server — upload a screenshot instead (or set CHROME_PATH).");
        }

        $workDir = storage_path('app/private/captures/'.Str::random(16));
        File::ensureDirectoryExists($workDir);
        $screenshot = $workDir.DIRECTORY_SEPARATOR.'shot.png';

        try {
            $process = new Process([
                $browser,
                '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
                '--no-first-run', '--no-default-browser-check', '--ignore-certificate-errors',
                '--user-data-dir='.$workDir.DIRECTORY_SEPARATOR.'profile',
                '--window-size=1440,900',
                '--virtual-time-budget=15000',
                '--screenshot='.$screenshot,
                $url,
            ], env: $this->browserEnvironment($workDir));
            $process->setTimeout(60);

            try {
                $process->run();
            } catch (ProcessTimedOutException) {
                throw new MediaException('The site took too long to load.');
            }

            if (! is_file($screenshot)) {
                throw new MediaException("The site didn't produce a screenshot (it may be down).");
            }

            $host = Str::of(parse_url($url, PHP_URL_HOST) ?: 'site')->replaceStart('www.', '')->replace('.', '-');

            return $this->images->store((string) file_get_contents($screenshot), 'preview-'.$host, $user, maxDimension: 720);
        } finally {
            File::deleteDirectory($workDir);
        }
    }

    /**
     * `php artisan serve` and PHP-FPM (clear_env) strip most variables; Chrome needs writable
     * temp/profile locations, so point them all at the throwaway work directory.
     *
     * @return array<string, string>
     */
    private function browserEnvironment(string $workDir): array
    {
        return array_filter([
            'TEMP' => $workDir,
            'TMP' => $workDir,
            'TMPDIR' => $workDir,
            'HOME' => $workDir,
            'LOCALAPPDATA' => $workDir,
            'APPDATA' => $workDir,
            'USERPROFILE' => $workDir,
            'SystemRoot' => getenv('SystemRoot') ?: (PHP_OS_FAMILY === 'Windows' ? 'C:\\Windows' : ''),
        ]);
    }

    private function findBrowser(): ?string
    {
        $candidates = array_filter([config('services.chrome.path'), ...self::BROWSERS]);

        foreach ($candidates as $path) {
            if (is_file($path)) {
                return $path;
            }
        }

        return null;
    }
}
