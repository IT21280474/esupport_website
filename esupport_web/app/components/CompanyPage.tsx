"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Image from "./ContentImage";
import Navbar from "./Navbar";
import Cursor from "./Cursor";
import PostLightbox from "./PostLightbox";
import VideoLightbox from "./VideoLightbox";
import { useContent } from "./SiteContentProvider";
import { companyEntries, POSTS_ANCHOR } from "@/lib/content/companies";
import { getVideosForCompany } from "../data/portfolio-videos";

const ease = [0.76, 0, 0.24, 1] as const;
const LIGHT_BG = "#fafaf8";
const BRAND_COLORS = ["var(--brand-1)", "var(--brand-2)", "var(--brand-3)", "var(--brand-4)", "var(--brand-5)"] as const;

/* Brand yellow and light green are too faint as text on the light page, so text accents are darkened (same hue). */
const textAccent = (accent: string) => `color-mix(in srgb, ${accent} 62%, #111111)`;

const pad2 = (n: number) => String(n).padStart(2, "0");
const isExternal = (href: string) => /^https?:\/\//i.test(href);
/* "srilankaholidays.net" for a website, "Facebook page" / "Instagram page" for social links. */
const linkLabel = (url: string) => {
    try {
        const host = new URL(url).hostname.replace(/^www\./, "");
        if (host.endsWith("facebook.com")) return "Facebook page";
        if (host.endsWith("instagram.com")) return "Instagram page";
        return host;
    } catch {
        return url;
    }
};

/* ── Small pieces ─────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.5em] text-brand-navy/40">{children}</p>;
}

function ItemList({ title, items, accent }: { title: string; items: string[]; accent: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease }}
        >
            <SectionLabel>{title}</SectionLabel>
            <ol className="border-t border-brand-navy/10">
                {items.map((item, i) => (
                    <li key={`${item}-${i}`} className="flex gap-4 border-b border-brand-navy/10 py-4">
                        <span className="w-6 shrink-0 pt-0.5 font-mono text-[11px]" style={{ color: textAccent(accent) }}>
                            {pad2(i + 1)}
                        </span>
                        <span className="text-[15px] leading-relaxed text-brand-navy/80">{item}</span>
                    </li>
                ))}
            </ol>
        </motion.div>
    );
}

/* Returns to the Creative Posts block on the home page, skipping the intro. */
function BackButton({ label }: { label: string }) {
    return (
        <Link
            href={`/#${POSTS_ANCHOR}`}
            data-hover
            className="inline-flex items-center gap-2.5 sm:gap-3 border border-brand-navy/25 bg-white px-3.5 sm:px-5 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-colors hover:bg-brand-navy hover:text-white active:scale-95 shadow-sm max-w-full"
        >
            <span aria-hidden className="shrink-0">←</span>
            <span className="truncate">Back to {label}</span>
        </Link>
    );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CompanyPage({ slug }: { slug: string }) {
    const { portfolio, footer, general } = useContent();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [openVideoIndex, setOpenVideoIndex] = useState<number | null>(null);

    const entries = useMemo(() => companyEntries(portfolio.postClients), [portfolio.postClients]);
    const position = entries.findIndex(c => c.slug === slug);
    const company = entries[position];
    const next = entries.length > 1 ? entries[(position + 1) % entries.length] : undefined;

    const companyVideos = useMemo(() => (company ? getVideosForCompany(company.slug, portfolio.videoReels) : []), [company, portfolio.videoReels]);
    const hasVideos = companyVideos.length > 0;

    const closeViewer = useCallback(() => setOpenIndex(null), []);
    const backLabel = [portfolio.postsTitle1, portfolio.postsTitle2].filter(Boolean).join(" ") || "Portfolio";
    const socials = footer.socials.filter(s => s.href);

    if (!company) return null;

    const accent = BRAND_COLORS[position % BRAND_COLORS.length];
    const hasDetails = Boolean(company.summary || company.services.length || company.objectives.length);
    const hasPosts = company.posts.length > 0;
    const hasMedia = hasPosts || hasVideos;

    return (
        <MotionConfig reducedMotion="user">
            <Cursor />
            <Navbar />

            <main className="text-brand-navy" style={{ backgroundColor: LIGHT_BG, fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,sans-serif" }}>
                {/* ── Company (left) and its posts (right), side by side from the top of the page ──
                    On a phone the order is: title, posts, then the details. */}
                <div className="mx-auto grid max-w-7xl gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-8 sm:gap-y-12 px-4 sm:px-6 md:px-8 pb-14 sm:pb-20 md:pb-24 pt-24 sm:pt-28 md:pt-36 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
                    {/* Title */}
                    <header className={`min-w-0 max-lg:order-1 ${hasMedia ? "lg:col-span-5" : "lg:col-span-12"}`}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
                            <BackButton label={backLabel} />
                        </motion.div>

                        <div className="mt-6 sm:mt-10">
                            {company.industry && (
                                <motion.p
                                    className="mb-2 sm:mb-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] sm:tracking-[0.5em]"
                                    style={{ color: textAccent(accent) }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.05, ease }}
                                >
                                    {company.industry}
                                </motion.p>
                            )}
                            <motion.h1
                                className={`font-black uppercase leading-[0.95] sm:leading-[0.9] tracking-[-0.03em] break-words [overflow-wrap:anywhere] ${
                                    hasMedia ? "text-[clamp(1.75rem,7vw,4.5rem)] lg:text-[clamp(2.2rem,4vw,3.6rem)]" : "text-[clamp(2.1rem,8vw,7rem)]"
                                }`}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, delay: 0.1, ease }}
                            >
                                {company.name}
                            </motion.h1>
                        </div>

                        {company.logo && (
                            <motion.div
                                className="relative mt-5 sm:mt-8 h-16 w-32 sm:h-24 sm:w-44 border border-brand-navy/10 md:h-28 md:w-52 shadow-sm"
                                style={{ backgroundColor: company.logoBackground === "Dark" ? "#111111" : "#ffffff" }}
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.25, ease }}
                            >
                                <Image src={company.logo} alt={`${company.name} logo`} fill sizes="(max-width: 640px) 128px, 208px" className="object-contain p-2.5 sm:p-4 md:p-5" />
                            </motion.div>
                        )}
                    </header>

                    {/* Details */}
                    {hasDetails && (
                        <div className={`space-y-8 sm:space-y-12 max-lg:order-3 ${hasMedia ? "lg:col-span-5" : "lg:col-span-8"}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.7, ease }}
                            >
                                <SectionLabel>About the company</SectionLabel>
                                {company.summary && <p className="text-base sm:text-lg leading-relaxed text-brand-navy/80 md:text-xl">{company.summary}</p>}
                                {company.websiteUrl && (
                                    <a
                                        href={company.websiteUrl}
                                        {...(isExternal(company.websiteUrl) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        data-hover
                                        className="mt-6 sm:mt-8 inline-flex items-center gap-2.5 sm:gap-3 border border-brand-navy/20 px-4 sm:px-5 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-colors hover:bg-brand-navy hover:text-white active:scale-95 max-w-full"
                                    >
                                        <span className="truncate">Visit {linkLabel(company.websiteUrl)}</span> <span aria-hidden className="shrink-0">↗︎</span>
                                    </a>
                                )}
                            </motion.div>

                            {company.services.length > 0 && <ItemList title="What we did" items={company.services} accent={accent} />}
                            {company.objectives.length > 0 && <ItemList title="Objectives" items={company.objectives} accent={accent} />}
                        </div>
                    )}

                    {/* Posts and Videos column: beside title on desktop */}
                    {hasMedia && (
                        <div className="max-lg:order-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 space-y-8 sm:space-y-12">
                            {hasPosts && (
                                <div>
                                    <div className="mb-3.5 sm:mb-5 flex items-baseline justify-between gap-4">
                                        <p className="font-mono text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.5em] text-brand-navy/40">
                                            Post designs
                                            <span className="ml-2 sm:ml-3 text-brand-navy/80">
                                                {company.posts.length} {company.posts.length === 1 ? "post" : "posts"}
                                            </span>
                                        </p>
                                        <p className="text-right text-[11px] sm:text-xs text-brand-navy/45">Tap to view full size.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                                        {company.posts.map((post, i) => (
                                            <motion.button
                                                key={`${post.image}-${i}`}
                                                type="button"
                                                data-hover
                                                onClick={() => setOpenIndex(i)}
                                                aria-label={`Open post ${i + 1} of ${company.posts.length}`}
                                                className="group relative block aspect-[4/5] w-full overflow-hidden border border-brand-navy/10 bg-white active:scale-[0.98] transition-transform"
                                                initial={{ opacity: 0, y: 36 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                                                transition={{ duration: 0.7, ease, delay: (i % 2) * 0.07 }}
                                            >
                                                <Image
                                                    src={post.image}
                                                    alt={`${company.name} post ${i + 1}`}
                                                    fill
                                                    sizes="(max-width: 1024px) 50vw, 360px"
                                                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]"
                                                />
                                                <span className="absolute left-2 top-2 sm:left-3 sm:top-3 bg-black/65 px-1.5 py-0.5 sm:px-2 sm:py-1 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-white">{pad2(i + 1)}</span>
                                                {/* Mobile touch indicator */}
                                                <span className="sm:hidden absolute right-2 bottom-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-[9px] backdrop-blur-sm" aria-hidden>
                                                    ↗
                                                </span>
                                                <span className="absolute inset-0 hidden sm:flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent pb-4 sm:pb-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-navy shadow" style={{ backgroundColor: accent }}>
                                                        View ↗︎
                                                    </span>
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Videos: placed below the posts */}
                            {hasVideos && (
                                <div className={hasPosts ? "pt-6 sm:pt-8 border-t border-brand-navy/10" : ""}>
                                    <div className="mb-3.5 sm:mb-5 flex items-baseline justify-between gap-4">
                                        <p className="font-mono text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.5em] text-brand-navy/40">
                                            Commercial Video Reels
                                            <span className="ml-2 sm:ml-3 text-brand-navy/80">
                                                {companyVideos.length} {companyVideos.length === 1 ? "reel" : "reels"}
                                            </span>
                                        </p>
                                        <p className="text-right text-[11px] sm:text-xs text-brand-navy/45">Tap to play with sound.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                                        {companyVideos.map((video, idx) => (
                                            <motion.button
                                                key={video.id}
                                                type="button"
                                                data-hover
                                                onClick={() => setOpenVideoIndex(idx)}
                                                aria-label={`Open reel: ${video.title}`}
                                                className="group relative block aspect-[9/16] w-full overflow-hidden border border-brand-navy/10 bg-black text-left shadow-sm active:scale-[0.98] transition-transform"
                                                initial={{ opacity: 0, y: 36 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                                                transition={{ duration: 0.7, ease, delay: (idx % 2) * 0.07 }}
                                            >
                                                <Image
                                                    src={video.posterSrc}
                                                    alt={video.title}
                                                    fill
                                                    sizes="(max-width: 1024px) 50vw, 360px"
                                                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 z-10">
                                                    <span className="bg-black/65 px-1.5 py-0.5 sm:px-2 sm:py-1 font-mono text-[8px] sm:text-[10px] tracking-[0.2em] text-white">
                                                        {pad2(idx + 1)}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 text-[7px] sm:text-[9px] font-mono tracking-wider uppercase font-bold text-brand-navy" style={{ backgroundColor: video.accent }}>
                                                        {video.duration}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 z-10">
                                                    <p className="text-[7px] sm:text-[9px] tracking-[0.2em] uppercase font-mono text-white/50">{video.category}</p>
                                                    <h5 className="text-[11px] sm:text-sm font-bold uppercase text-white tracking-tight line-clamp-2 mt-0.5 leading-snug">{video.title}</h5>
                                                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
                                                        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white text-brand-navy text-[8px] sm:text-[10px] font-bold">
                                                            ▶
                                                        </span>
                                                        <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-mono text-white/70">Play Reel</span>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Back (repeated at the end of the page) ── */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-10 sm:pb-16">
                    <BackButton label={backLabel} />
                </section>

                {/* ── Next company ── */}
                {next && (
                    <section className="border-t border-brand-navy/10">
                        <Link href={`/clients/${next.slug}`} data-hover className="group mx-auto flex max-w-7xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 md:px-8 py-8 sm:py-16 active:bg-brand-navy/5 transition-colors">
                            <div className="min-w-0 flex-1">
                                <p className="mb-1.5 sm:mb-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-brand-navy/40">Next company</p>
                                <p
                                    className="break-words line-clamp-2 sm:truncate font-black uppercase leading-[0.95] sm:leading-[0.9] tracking-tighter transition-transform duration-500 group-hover:translate-x-2"
                                    style={{ fontSize: "clamp(1.5rem, 5vw, 4rem)" }}
                                >
                                    {next.name}
                                </p>
                            </div>
                            <span className="shrink-0 text-2xl sm:text-4xl transition-transform duration-500 group-hover:translate-x-2 md:text-6xl pl-2" style={{ color: textAccent(accent) }} aria-hidden>
                                →
                            </span>
                        </Link>
                    </section>
                )}

                {/* ── Closing banner ── */}
                {portfolio.companyCtaTitle && (
                    <section className="bg-brand-navy px-4 sm:px-6 md:px-8 py-14 sm:py-24 text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease }}
                        >
                            <p className="mx-auto max-w-3xl font-black uppercase leading-[0.98] sm:leading-[0.95] tracking-[-0.03em]" style={{ fontSize: "clamp(1.7rem, 6vw, 4.5rem)" }}>
                                {portfolio.companyCtaTitle}
                            </p>
                            {portfolio.companyCtaLabel && portfolio.companyCtaHref && (
                                <a
                                    href={portfolio.companyCtaHref}
                                    {...(isExternal(portfolio.companyCtaHref) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    data-hover
                                    className="mt-6 sm:mt-10 inline-block px-6 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white transition-opacity active:scale-95 hover:opacity-80 max-w-full truncate shadow-lg"
                                    style={{ backgroundColor: "var(--brand-1)" }}
                                >
                                    {portfolio.companyCtaLabel}
                                </a>
                            )}
                        </motion.div>
                    </section>
                )}

                {/* ── Footer ── */}
                <footer className="border-t border-brand-navy/10 px-4 sm:px-6 md:px-8 pb-8 sm:pb-10 pt-10 sm:pt-16" style={{ backgroundColor: LIGHT_BG }}>
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
                        <Link href="/" data-hover className="self-start">
                            <Image src={general.footerLogo || "/logo1.png"} alt="eSupport" width={140} height={50} className="h-9 sm:h-11 w-auto object-contain" />
                        </Link>
                        {socials.length > 0 && (
                            <nav aria-label="Social links" className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-brand-navy/60">
                                {socials.map(s => (
                                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="py-1 transition-colors hover:text-brand-navy">
                                        {s.name}
                                    </a>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="mx-auto mt-8 sm:mt-10 flex max-w-7xl flex-col justify-between gap-2 border-t border-brand-navy/10 pt-6 text-[9px] sm:text-[10px] uppercase tracking-widest text-brand-navy/40 md:flex-row">
                        <p>{footer.copyright}</p>
                        <p>{footer.location}</p>
                    </div>
                </footer>
            </main>

            <AnimatePresence>
                {openIndex !== null && company.posts[openIndex] && (
                    <PostLightbox key="viewer" name={company.name} posts={company.posts} startIndex={openIndex} accent={accent} onClose={closeViewer} />
                )}
                {openVideoIndex !== null && companyVideos[openVideoIndex] && (
                    <VideoLightbox
                        key="video-viewer"
                        videos={companyVideos}
                        startIndex={openVideoIndex}
                        onClose={() => setOpenVideoIndex(null)}
                    />
                )}
            </AnimatePresence>
        </MotionConfig>
    );
}
