"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "./ContentImage";
import Navbar from "./Navbar";
import Cursor from "./Cursor";
import { useContent } from "./SiteContentProvider";
import type { GalleryPhoto, GalleryShape } from "@/lib/content/types";

const ease = [0.76, 0, 0.24, 1] as const;
const LIGHT_BG = "#fafaf8";
const BRAND_COLORS = ["var(--brand-1)", "var(--brand-2)", "var(--brand-3)", "var(--brand-4)", "var(--brand-5)"] as const;

/* Grid crop per photo — set in Admin → Gallery Page. The viewer always shows the full photo. */
const ASPECT: Record<GalleryShape, string> = {
    Portrait: "aspect-[4/5]",
    Landscape: "aspect-[4/3]",
    Square: "aspect-square",
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const isExternal = (href: string) => /^https?:\/\//i.test(href);
const accentFor = (categories: string[], category: string | undefined) =>
    BRAND_COLORS[Math.max(0, category ? categories.indexOf(category) : 0) % BRAND_COLORS.length];

/* ── One photo in the grid ────────────────────────────────────────────────── */
function PhotoTile({ photo, index, onOpen }: { photo: GalleryPhoto; index: number; onOpen: () => void }) {
    return (
        <motion.div
            className="mb-4 break-inside-avoid"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.7, ease, delay: (index % 4) * 0.07 }}
        >
            <button
                type="button"
                data-hover
                onClick={onOpen}
                aria-label={`View ${photo.title || "photo"}`}
                className={`group relative block w-full overflow-hidden bg-neutral-200 active:scale-[0.98] transition-transform duration-200 ${ASPECT[photo.shape] ?? ASPECT.Portrait}`}
            >
                <Image
                    src={photo.image}
                    alt={photo.caption || photo.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                <span className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 text-left text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="text-sm font-bold tracking-wide">{photo.title}</span>
                    {photo.categories.length > 0 && (
                        <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/70">{photo.categories.join(" · ")}</span>
                    )}
                </span>
            </button>
        </motion.div>
    );
}

/* ── Full-screen viewer ───────────────────────────────────────────────────── */
function Lightbox({
    photos,
    index,
    categories,
    onIndex,
    onClose,
}: {
    photos: GalleryPhoto[];
    index: number;
    categories: string[];
    onIndex: (i: number) => void;
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const photo = photos[index];
    const total = photos.length;

    const prev = useCallback(() => onIndex((index - 1 + total) % total), [index, total, onIndex]);
    const next = useCallback(() => onIndex((index + 1) % total), [index, total, onIndex]);

    /* Lock page scroll while open; give focus to the dialog and hand it back on close. */
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.querySelector<HTMLElement>("[data-close]")?.focus();
        return () => {
            document.body.style.overflow = overflow;
            previouslyFocused?.focus();
        };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") return onClose();
            if (e.key === "ArrowLeft") return prev();
            if (e.key === "ArrowRight") return next();
            if (e.key !== "Tab") return;

            /* Keep Tab inside the viewer. */
            const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
            if (!buttons?.length) return;
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, prev, next]);

    const arrow = "absolute top-1/2 z-10 hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-base sm:text-lg text-white transition-colors hover:bg-white hover:text-black active:scale-90";

    return (
        <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            className="fixed inset-0 h-screen h-[100dvh] z-[700] flex flex-col bg-neutral-950 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5">
                <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-white/50">
                    {pad2(index + 1)} / {pad2(total)}
                </p>
                <button
                    type="button"
                    data-close
                    data-hover
                    onClick={onClose}
                    aria-label="Close viewer"
                    className="border border-white/25 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.35em] transition-colors hover:bg-white hover:text-black active:scale-95"
                >
                    Close ✕
                </button>
            </div>

            <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-4 md:px-24"
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                {total > 1 && (
                    <button type="button" data-hover onClick={prev} aria-label="Previous photo" className={`${arrow} left-2 sm:left-3 md:left-6`}>
                        ←
                    </button>
                )}
                <motion.div
                    key={`${index}-${photo.image}`}
                    className="relative h-full w-full max-w-6xl"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease }}
                    drag={total > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -80) next();
                        else if (info.offset.x > 80) prev();
                    }}
                >
                    <Image src={photo.image} alt={photo.caption || photo.title} fill sizes="100vw" draggable={false} className="select-none object-contain" />
                </motion.div>
                {total > 1 && (
                    <button type="button" data-hover onClick={next} aria-label="Next photo" className={`${arrow} right-2 sm:right-3 md:right-6`}>
                        →
                    </button>
                )}
            </div>

            <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-3 sm:pt-5 text-center">
                <p className="text-base sm:text-lg font-bold tracking-wide">{photo.title}</p>
                {photo.caption && <p className="mx-auto mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-white/60">{photo.caption}</p>}
                {photo.categories.length > 0 && (
                    <p className="mt-2 sm:mt-3 flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/50">
                        {photo.categories.map(c => (
                            <span key={c} className="inline-flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentFor(categories, c) }} />
                                {c}
                            </span>
                        ))}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function GalleryPage() {
    const { galleryPage: page, footer, general } = useContent();
    const [filter, setFilter] = useState<string | null>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    /* A photo without an image (added in the admin but not filled in yet) is left out. */
    const photos = useMemo(() => page.photos.filter(p => p.image), [page.photos]);
    const shown = useMemo(() => (filter === null ? photos : photos.filter(p => p.categories.includes(filter))), [filter, photos]);

    const chips = [
        { name: null as string | null, label: page.allLabel, count: photos.length, accent: "#111111" },
        ...page.categories
            .map(c => ({ name: c as string | null, label: c, count: photos.filter(p => p.categories.includes(c)).length, accent: accentFor(page.categories, c) }))
            .filter(c => c.count > 0),
    ];

    const closeViewer = useCallback(() => setOpenIndex(null), []);
    const socials = footer.socials.filter(s => s.href);

    return (
        <MotionConfig reducedMotion="user">
            <Cursor />
            <Navbar />

            <main className="text-brand-navy" style={{ backgroundColor: LIGHT_BG, fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,sans-serif" }}>
                {/* ── Header ── */}
                <header className="mx-auto max-w-7xl px-5 sm:px-8 pb-8 sm:pb-12 pt-28 sm:pt-36 md:pt-40">
                    <motion.p
                        className="mb-4 sm:mb-6 font-mono text-[10px] uppercase tracking-[0.5em] text-brand-navy/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease }}
                    >
                        {page.eyebrow}
                    </motion.p>
                    <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 sm:gap-y-8">
                        <motion.h1
                            className="font-black uppercase leading-[0.9] sm:leading-[0.85] tracking-[-0.04em] break-words"
                            style={{ fontSize: "clamp(2.4rem, 10vw, 10rem)" }}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.1, ease }}
                        >
                            {page.titleLine1}
                            <br />
                            <span style={{ WebkitTextStroke: "2px #111111", color: "transparent" }}>{page.titleLine2}</span>
                        </motion.h1>
                        <motion.p
                            className="max-w-sm pb-2 text-xs sm:text-sm leading-relaxed text-brand-navy/55"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.25, ease }}
                        >
                            {page.intro}
                        </motion.p>
                    </div>
                </header>

                {/* ── Filter + grid ── */}
                <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16 sm:pb-28">
                    {chips.length > 2 && (
                        <div className="-mx-5 px-5 sm:-mx-8 sm:px-8 mb-8 sm:mb-12 overflow-x-auto touch-pan-x overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-lenis-prevent>
                            <div className="flex w-max gap-2 pb-1 md:w-auto md:flex-wrap">
                                {chips.map(chip => {
                                    const active = filter === chip.name;
                                    return (
                                        <button
                                            key={chip.name ?? "__all"}
                                            type="button"
                                            data-hover
                                            aria-pressed={active}
                                            onClick={() => setFilter(chip.name)}
                                            className="relative whitespace-nowrap border px-3.5 sm:px-4 py-2 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] transition-all duration-300 active:scale-95"
                                            style={{
                                                borderColor: active ? chip.accent : "rgba(17,17,17,0.15)",
                                                backgroundColor: active ? chip.accent : "transparent",
                                                color: active ? (chip.name === null ? "#ffffff" : "#111111") : "rgba(17,17,17,0.6)",
                                            }}
                                        >
                                            {chip.label}
                                            <sup className="ml-1.5 font-mono opacity-60">{chip.count}</sup>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {shown.length ? (
                        <div key={filter ?? "__all"} className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                            {shown.map((photo, i) => (
                                <PhotoTile key={`${photo.image}-${i}`} photo={photo} index={i} onOpen={() => setOpenIndex(i)} />
                            ))}
                        </div>
                    ) : (
                        <p className="py-24 text-center text-sm text-brand-navy/45">No photos here yet — check back soon.</p>
                    )}
                </section>

                {/* ── Closing banner ── */}
                {page.ctaTitle && (
                    <section className="bg-brand-navy px-5 sm:px-8 py-16 sm:py-24 text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease }}
                        >
                            <p className="mx-auto max-w-3xl font-black uppercase leading-[0.95] tracking-[-0.03em]" style={{ fontSize: "clamp(1.8rem, 6vw, 4.5rem)" }}>
                                {page.ctaTitle}
                            </p>
                            {page.ctaLabel && page.ctaHref && (
                                <a
                                    href={page.ctaHref}
                                    {...(isExternal(page.ctaHref) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    data-hover
                                    className="mt-8 sm:mt-10 inline-block px-6 sm:px-8 py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-white transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: "var(--brand-1)" }}
                                >
                                    {page.ctaLabel}
                                </a>
                            )}
                        </motion.div>
                    </section>
                )}

                {/* ── Footer ── */}
                <footer className="border-t border-brand-navy/10 px-5 sm:px-8 pb-8 sm:pb-10 pt-12 sm:pt-16" style={{ backgroundColor: LIGHT_BG }}>
                    <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <Link href="/" data-hover>
                            <Image src={general.footerLogo || "/logo1.png"} alt="eSupport" width={140} height={50} className="h-10 sm:h-11 w-auto object-contain" />
                        </Link>
                        {socials.length > 0 && (
                            <nav aria-label="Social links" className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-brand-navy/60">
                                {socials.map(s => (
                                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand-navy">
                                        {s.name}
                                    </a>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="mx-auto mt-8 sm:mt-10 flex max-w-7xl flex-col justify-between gap-2 border-t border-brand-navy/10 pt-6 text-[10px] uppercase tracking-widest text-brand-navy/35 md:flex-row">
                        <p>{footer.copyright}</p>
                        <p>{footer.location}</p>
                    </div>
                </footer>
            </main>

            <AnimatePresence>
                {openIndex !== null && shown[openIndex] && (
                    <Lightbox key="viewer" photos={shown} index={openIndex} categories={page.categories} onIndex={setOpenIndex} onClose={closeViewer} />
                )}
            </AnimatePresence>
        </MotionConfig>
    );
}
