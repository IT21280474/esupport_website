/* Captures desktop website previews for the portfolio grid.
 *
 *   node scripts/capture-portfolio.mjs            # only missing previews
 *   node scripts/capture-portfolio.mjs --force    # re-capture everything
 *   node scripts/capture-portfolio.mjs sandaru    # only the given slugs
 *
 * Uses the locally installed Chrome/Edge in headless mode and sharp (bundled
 * with Next) to write /public/portfolio/<slug>.webp.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "portfolio");
const VIEWPORT = { width: 1440, height: 900 };
const OUTPUT_WIDTH = 720;
const CONCURRENCY = 5;
const TIMEOUT_MS = 60_000;

const BROWSERS = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
].filter(Boolean);
const browser = BROWSERS.find(p => existsSync(p));
if (!browser) throw new Error("No Chrome/Edge found — set CHROME_PATH");

/* Pull slug + url pairs straight from the data file so there is one source of truth */
const source = readFileSync(path.join(ROOT, "app", "data", "portfolio.ts"), "utf8");
const targets = [...source.matchAll(/slug:\s*"([^"]+)",\s*name:\s*"[^"]*",\s*url:\s*"([^"]+)"/g)]
    .map(([, slug, url]) => ({ slug, url }));
const dmUrl = source.match(/DM_PORTFOLIO_URL\s*=\s*"([^"]+)"/)?.[1];
if (dmUrl) targets.push({ slug: "dm-portfolio", url: dmUrl });

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter(a => !a.startsWith("--"));

const queue = targets.filter(t =>
    only.length ? only.includes(t.slug) : force || !existsSync(path.join(OUT_DIR, `${t.slug}.webp`))
);

mkdirSync(OUT_DIR, { recursive: true });
console.log(`Capturing ${queue.length} of ${targets.length} previews with ${path.basename(browser)}`);

function capture({ slug, url }) {
    const profile = mkdtempSync(path.join(tmpdir(), "es-shot-"));
    const png = path.join(profile, "shot.png");
    return new Promise(resolve => {
        const proc = spawn(browser, [
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--mute-audio",
            "--no-first-run",
            "--no-default-browser-check",
            "--ignore-certificate-errors",
            `--user-data-dir=${profile}`,
            `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
            "--virtual-time-budget=15000",
            `--screenshot=${png}`,
            url,
        ], { stdio: "ignore" });
        const timer = setTimeout(() => proc.kill(), TIMEOUT_MS);
        proc.on("exit", async () => {
            clearTimeout(timer);
            try {
                if (!existsSync(png)) throw new Error("no screenshot produced");
                const img = sharp(png);
                const { channels } = await img.stats();
                const spread = channels.slice(0, 3).reduce((s, c) => s + c.stdev, 0) / 3;
                await img
                    .resize({ width: OUTPUT_WIDTH })
                    .webp({ quality: 72 })
                    .toFile(path.join(OUT_DIR, `${slug}.webp`));
                const flag = spread < 8 ? "  ⚠ looks blank" : "";
                console.log(`✓ ${slug}${flag}`);
                resolve({ slug, ok: true, blank: spread < 8 });
            } catch (err) {
                console.log(`✗ ${slug} — ${err.message}`);
                resolve({ slug, ok: false });
            } finally {
                rmSync(profile, { recursive: true, force: true });
            }
        });
    });
}

const results = [];
let next = 0;
await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (next < queue.length) results.push(await capture(queue[next++]));
    })
);

const failed = results.filter(r => !r.ok).map(r => r.slug);
const blank = results.filter(r => r.blank).map(r => r.slug);
console.log(`\nDone: ${results.length - failed.length} captured, ${failed.length} failed`);
if (failed.length) console.log("Failed:", failed.join(", "));
if (blank.length) console.log("Possibly blank:", blank.join(", "));
