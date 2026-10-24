"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import Image from "./ContentImage";
import PostDesigns from "./PostDesigns";
import VideoReels from "./VideoReels";
import { useContent } from "./SiteContentProvider";
import { slugify } from "@/lib/content/companies";
import type { PortfolioSite } from "@/lib/content/types";

const ease = [0.76, 0, 0.24, 1] as const;
const BRAND_COLORS = ["var(--brand-1)", "var(--brand-2)", "var(--brand-3)", "var(--brand-4)", "var(--brand-5)"] as const;
const PAGE_SIZE = 9;

const accentFor = (categories: string[], cat: string | undefined) =>
    BRAND_COLORS[Math.max(0, cat ? categories.indexOf(cat) : 0) % BRAND_COLORS.length];

const domainOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/* ── Browser-framed screenshot ────────────────────────────────────────────── */
function BrowserPreview({
    src,
    alt,
    domain,
    accent,
    label = "Visit Live Site",
    sizes,
}: {
    src: string;
    alt: string;
    domain: string;
    accent: string;
    label?: string;
    sizes: string;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <div className="relative overflow-hidden border border-white/10 bg-white/[0.03] transition-colors duration-500 group-hover:border-white/25">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 h-9 border-b border-white/10 bg-white/[0.04]">
                <div className="flex gap-1.5 shrink-0">
                    {BRAND_COLORS.slice(0, 3).map(c => (
                        <span key={c} className="w-2 h-2 rounded-full opacity-70" style={{ backgroundColor: c }} />
                    ))}
                </div>
                <p className="flex-1 min-w-0 truncate text-center text-[10px] font-mono tracking-wide text-white/40 bg-white/[0.05] px-3 py-1">
                    {domain}
                </p>
                <span className="text-xs text-white/30 transition-colors duration-300 group-hover:text-white shrink-0">↗︎</span>
            </div>

            {/* Screenshot */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#161616]">
                {failed || !src ? (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-transform duration-[1.2s] group-hover:scale-[1.04]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${accent} 20%, transparent), transparent 70%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                            backgroundSize: "auto, 32px 32px, 32px 32px",
                        }}
                    >
                        <span className="text-7xl font-black uppercase tracking-tighter leading-none" style={{ color: accent }}>
                            {alt.charAt(0)}
                        </span>
                        <span className="text-[10px] tracking-[0.4em] uppercase font-mono text-white/40">{domain}</span>
                    </div>
                ) : (
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes={sizes}
                        className="object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]"
                        onError={() => setFailed(true)}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span
                        className="px-5 py-2.5 text-[10px] tracking-[0.35em] uppercase font-bold text-brand-navy"
                        style={{ backgroundColor: accent }}
                    >
                        {label} ↗︎
                    </span>
                </div>
            </div>

            {/* Accent bar */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                style={{ backgroundColor: accent }}
            />
        </div>
    );
}

/* ── Website card ─────────────────────────────────────────────────────────── */
function SiteCard({ site, index, delay, accent }: { site: PortfolioSite; index: number; delay: number; accent: string }) {
    return (
        <motion.a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            className="group block active:scale-[0.98] transition-transform"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay, ease }}
        >
            <BrowserPreview
                src={site.image}
                alt={site.name}
                domain={domainOf(site.url)}
                accent={accent}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="mt-4 sm:mt-5 flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-mono" style={{ color: accent }}>
                        {site.categories.join(" · ")}
                    </p>
                    <h3 className="mt-1.5 sm:mt-2 text-lg sm:text-xl md:text-2xl font-normal uppercase tracking-wide text-white leading-tight transition-transform duration-300 group-hover:translate-x-1">
                        {site.name}
                    </h3>
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] font-mono text-white/25 pt-0.5 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>
        </motion.a>
    );
}

/* ── Company logo for a social account (monogram when the company has no logo) ── */
type LogoSource = { src: string; background: "Light" | "Dark" };

const initialsOf = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();

function SocialLogo({ name, logo, accent }: { name: string; logo: LogoSource | undefined; accent: string }) {
    return (
        <span
            className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden border border-white/15 md:w-24"
            style={logo ? { backgroundColor: logo.background === "Dark" ? "#111111" : "#ffffff" } : { color: accent }}
        >
            {logo ? (
                <Image src={logo.src} alt={`${name} logo`} fill sizes="96px" className="object-contain p-1.5" />
            ) : (
                <span aria-hidden className="text-sm font-black tracking-tight">{initialsOf(name)}</span>
            )}
        </span>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   PORTFOLIO SHOWCASE — live client websites + digital marketing accounts
   ══════════════════════════════════════════════════════════════════════════ */
export default function PortfolioShowcase() {
    const { portfolio } = useContent();
    const { categories, sites } = portfolio;
    const [filter, setFilter] = useState<string>("All");
    const [visible, setVisible] = useState(PAGE_SIZE);

    const filtered = useMemo(
        () => (filter === "All" ? sites : sites.filter(s => s.categories.includes(filter))),
        [filter, sites]
    );
    const shown = filtered.slice(0, visible);
    const remaining = filtered.length - shown.length;

    /* A social account takes the logo of the company with the same name (set in Creative Posts). */
    const logosByCompany = useMemo(() => {
        const logos = new Map<string, LogoSource>();
        for (const company of portfolio.postClients ?? []) {
            const key = slugify(company.name ?? "");
            if (company.logo && !logos.has(key)) logos.set(key, { src: company.logo, background: company.logoBackground === "Dark" ? "Dark" : "Light" });
        }
        return logos;
    }, [portfolio.postClients]);

    const chips: { name: string; count: number; accent: string }[] = [
        { name: "All", count: sites.length, accent: "#ffffff" },
        ...categories
            .map(c => ({ name: c, count: sites.filter(s => s.categories.includes(c)).length, accent: accentFor(categories, c) }))
            .filter(c => c.count > 0),
    ];

    const selectFilter = (f: string) => {
        setFilter(f);
        setVisible(PAGE_SIZE);
    };

    return (
        <section className="bg-brand-navy text-white pt-16 sm:pt-20 pb-24 sm:pb-36 px-5 sm:px-8">
            <div className="max-w-7xl mx-auto">

                {/* ── Header row ── */}
                <div className="flex items-end justify-between flex-wrap gap-6 mb-8 sm:mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease }}
                    >
                        <p className="text-[10px] tracking-[0.5em] uppercase text-white/35 font-mono mb-2 sm:mb-3">{portfolio.eyebrow}</p>
                        <p className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none">
                            {sites.length}
                            <span className="text-white/25 text-xl sm:text-2xl md:text-3xl align-top ml-2">sites</span>
                        </p>
                    </motion.div>
                    <motion.p
                        className="text-xs sm:text-sm text-white/40 max-w-sm leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease }}
                    >
                        {portfolio.description}
                    </motion.p>
                </div>

                {/* ── Category filter ── */}
                <div className="-mx-5 px-5 sm:-mx-8 sm:px-8 mb-8 sm:mb-14 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain" data-lenis-prevent>
                    <div className="flex gap-2 w-max md:w-auto md:flex-wrap pb-1">
                        {chips.map(chip => {
                            const active = filter === chip.name;
                            return (
                                <button
                                    key={chip.name}
                                    data-hover
                                    onClick={() => selectFilter(chip.name)}
                                    className="relative px-3.5 py-2 sm:px-4 sm:py-2.5 text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase whitespace-nowrap border transition-colors duration-300"
                                    style={{
                                        borderColor: active ? chip.accent : "rgba(255,255,255,0.12)",
                                        backgroundColor: active ? chip.accent : "transparent",
                                        color: active ? "#111111" : "rgba(255,255,255,0.6)",
                                    }}
                                >
                                    {chip.name}
                                    <sup className="ml-1.5 font-mono opacity-60">{chip.count}</sup>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Website grid ── */}
                <div key={filter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14">
                    {shown.map((site, i) => (
                        <SiteCard key={`${site.url}-${i}`} site={site} index={i} delay={(i % PAGE_SIZE) * 0.06} accent={accentFor(categories, site.categories[0])} />
                    ))}
                </div>

                {/* ── Load more ── */}
                <div className="mt-14 sm:mt-20 flex flex-col items-center gap-4 sm:gap-5">
                    <div className="w-full max-w-xs h-px bg-white/10 relative overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0"
                            style={{ background: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3), var(--brand-4), var(--brand-5))" }}
                            animate={{ width: `${filtered.length ? (shown.length / filtered.length) * 100 : 0}%` }}
                            transition={{ duration: 0.6, ease }}
                        />
                    </div>
                    <p className="text-[10px] tracking-[0.4em] uppercase font-mono text-white/35">
                        Showing {shown.length} / {filtered.length}
                    </p>
                    {remaining > 0 && (
                        <button
                            data-hover
                            onClick={() => setVisible(v => v + PAGE_SIZE)}
                            className="px-8 sm:px-10 py-3.5 sm:py-4 border border-white/25 text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.4em] uppercase hover:bg-white hover:text-brand-navy transition-colors duration-300"
                        >
                            Load More · {remaining} ↓
                        </button>
                    )}
                </div>

                {/* ══ Digital marketing portfolio ══ */}
                <div className="mt-20 sm:mt-28 md:mt-36 pt-14 sm:pt-20 border-t border-white/10">
                    <div className="flex items-end justify-between flex-wrap gap-6 mb-10 sm:mb-14">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease }}
                        >
                            <p className="text-[10px] tracking-[0.5em] uppercase text-white/35 font-mono mb-2 sm:mb-3">{portfolio.socialEyebrow}</p>
                            <h3 className="text-[clamp(2.1rem,6vw,5rem)] font-black uppercase tracking-tighter leading-[0.9]">
                                {portfolio.socialTitle1}<br />
                                <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)", color: "transparent" }}>{portfolio.socialTitle2}</span>
                            </h3>
                        </motion.div>
                        <motion.p
                            className="text-xs sm:text-sm text-white/40 max-w-sm leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1, ease }}
                        >
                            {portfolio.socialDescription}
                        </motion.p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Featured: full DM portfolio site */}
                        <motion.a
                            href={portfolio.dmPortfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-hover
                            className="group block lg:col-span-5"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.85, ease }}
                        >
                            <BrowserPreview
                                src={portfolio.dmPortfolioImage}
                                alt="eSupport Digital Marketing Portfolio"
                                domain={domainOf(portfolio.dmPortfolioUrl)}
                                accent="var(--brand-1)"
                                label="Open Portfolio"
                                sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                            <div className="mt-5 sm:mt-6">
                                <p className="text-[10px] tracking-[0.4em] uppercase font-mono" style={{ color: "var(--brand-1)" }}>
                                    {portfolio.dmLabel}
                                </p>
                                <p className="mt-2 text-xl sm:text-2xl md:text-3xl font-normal uppercase tracking-wide leading-tight">
                                    {portfolio.dmTitle}
                                    <span className="inline-block ml-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: "var(--brand-1)" }}>↗︎</span>
                                </p>
                            </div>
                        </motion.a>

                        {/* Social accounts */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 border-t border-l border-white/10">
                            {portfolio.socialClients.map((client, i) => {
                                const accent = BRAND_COLORS[i % BRAND_COLORS.length];
                                return (
                                    <motion.a
                                        key={i}
                                        href={client.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-hover
                                        className="group relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 border-r border-b border-white/10 overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: i * 0.05, ease }}
                                    >
                                        <span
                                            className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
                                            style={{ backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)` }}
                                        />
                                        <SocialLogo name={client.name} logo={logosByCompany.get(slugify(client.name))} accent={accent} />
                                        <span className="relative min-w-0 flex-1">
                                            <span className="block text-xs sm:text-sm md:text-base font-normal uppercase tracking-wide leading-tight line-clamp-2">
                                                {client.name}
                                            </span>
                                            <span className="block text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-mono text-white/35 mt-1">
                                                {client.platform}
                                            </span>
                                        </span>
                                        <span
                                            className="relative text-base sm:text-lg opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                                            style={{ color: accent }}
                                        >
                                            ↗︎
                                        </span>
                                    </motion.a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ══ Post designs, grouped by company ══ */}
                <PostDesigns />

                {/* ══ Video productions & commercial reels ══ */}
                <VideoReels
                    eyebrow={portfolio.videosEyebrow}
                    title1={portfolio.videosTitle1}
                    title2={portfolio.videosTitle2}
                    description={portfolio.videosDescription}
                    reels={portfolio.videoReels}
                />
            </div>
        </section>
    );
}
