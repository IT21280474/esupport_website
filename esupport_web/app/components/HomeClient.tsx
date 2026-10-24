"use client";

import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useMotionValue,
    useSpring,
    useVelocity,
    useInView,
    MotionValue,
} from "framer-motion";
import { useRef, useState, useEffect, useActionState, useSyncExternalStore } from "react";
import Image from "./ContentImage";
import Lenis from "lenis";
import Navbar from "./Navbar";
import Cursor from "./Cursor";
import ServicesSection from "./Servicessection";
import PortfolioShowcase from "./PortfolioShowcase";
import { useContent } from "./SiteContentProvider";
import { submitLeadAction } from "../actions";
import type { LayoutSectionKey } from "@/lib/content/types";

const ease = [0.76, 0, 0.24, 1] as const;
const LIGHT_BG = "#fafaf8";

/* eSupport brand palette — cycling order for manifesto & accents */
const BRAND_COLORS = ["var(--brand-1)", "var(--brand-2)", "var(--brand-3)", "var(--brand-4)", "var(--brand-5)"] as const;

const accentAt = (i: number) => BRAND_COLORS[i % BRAND_COLORS.length];
const pad2 = (n: number) => String(n).padStart(2, "0");
/** Multi-line admin text → <br/> separated lines. */
const lines = (text: string) => text.split("\n").map((l, i, arr) => (
    <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
));

/* ── Module-level Lenis access for nav links ─────────────────────────────── */
let _lenis: Lenis | null = null;
let _gateRelease: (() => void) | null = null;

function navScrollTo(sectionId: string) {
    _gateRelease?.();
    _lenis?.scrollTo(`#${sectionId}`, { offset: -90, duration: 1.4 });
}

/* A #section in the URL (a link from another page, or coming back from a company page) means the
   visitor wants that spot, not the intro. It skips the hero scroll gate. The server
   can't see the hash, so it renders as if there were none and React switches over after hydration. */
const subscribeToHash = (onChange: () => void) => {
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
};
const hasSectionHash = () => window.location.hash.length > 1;
const noSectionHash = () => false;

/* ── Lenis smooth scroll ──────────────────────────────────────────────────── */
function useSmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
        _lenis = lenis;

        let rafId: number;
        const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
        rafId = requestAnimationFrame(raf);
        return () => {
            _lenis = null;
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);
}


/* ── Text reveal primitives ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <div className="overflow-hidden">
            <motion.div
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, delay, ease }}
            >
                {children}
            </motion.div>
        </div>
    );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 55 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, delay, ease }}
        >
            {children}
        </motion.div>
    );
}

/* ── Magnetic button ──────────────────────────────────────────────────────── */
function MagneticBtn({ children, className, strength = 0.4, onClick, type = "button", disabled }: {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 18 });
    const sy = useSpring(y, { stiffness: 200, damping: 18 });

    const onMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        x.set((e.clientX - left - width / 2) * strength);
        y.set((e.clientY - top - height / 2) * strength);
    };

    return (
        <motion.button
            ref={ref}
            style={{ x: sx, y: sy }}
            onMouseMove={onMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={className}
        >
            {children}
        </motion.button>
    );
}

/* ── Section label ────────────────────────────────────────────────────────── */
function SectionLabel({ num, label, className = "" }: { num: string; label: string; className?: string }) {
    return (
        <motion.div
            className={`flex items-center gap-3 ${className}`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
        >
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-mono">{num}</span>
            <span className="h-px w-8 bg-current opacity-30" />
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-50">{label}</span>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   HERO — Modern, High-Impact Editorial Agency Hero
   ══════════════════════════════════════════════════════════════════════════ */

const TILE_DETAILS: Record<string, { title: string; subtitle: string }> = {
    Brand: { title: "Brand Architecture", subtitle: "Iconic visual identities, style systems, and brand guidelines." },
    Social: { title: "Social Momentum", subtitle: "Connecting brands with culture through high-engagement creative." },
    Campaign: { title: "Omni-Channel Campaigns", subtitle: "Targeted multi-platform campaigns engineered for measurable ROI." },
    Strategy: { title: "Strategic Positioning", subtitle: "Market intelligence, conversion roadmaps, and digital strategy." },
    Creative: { title: "Creative Craftsmanship", subtitle: "Bespoke digital experiences, editorial motion, and UI/UX art." },
    Content: { title: "Content Ecosystems", subtitle: "High-retention storytelling built for modern digital channels." },
    Analytics: { title: "Performance Intelligence", subtitle: "Attribution modeling, conversion analytics, and real-time data." },
    Growth: { title: "Growth Acceleration", subtitle: "Hyper-scaling digital acquisition, revenue funnels, and retention." },
    Digital: { title: "Digital Engineering", subtitle: "Next-generation web applications, cloud systems, and performance." },
    Identity: { title: "Identity & Expression", subtitle: "Distinctive corporate identities, typography, and style manuals." },
};

function ModernHeroSection() {
    const { hero } = useContent();
    const tiles = hero.tiles && hero.tiles.length > 0 ? hero.tiles : [
        { tag: "Digital", image: "/uploads/tnasmq-glgwiu-hero-tile-09-digital.webp" },
        { tag: "Brand", image: "/uploads/tnasmo-czrmaa-hero-tile-01-brand.webp" },
        { tag: "Campaign", image: "/uploads/tnasmp-yhsh58-hero-tile-03-campaign.webp" },
        { tag: "Growth", image: "/uploads/tnasmp-6nc52o-hero-tile-08-growth.webp" },
        { tag: "Strategy", image: "/uploads/tnasmp-7tn96o-hero-tile-04-strategy.webp" },
    ];

    const [activeIdx, setActiveIdx] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-advance showcase every 4.5s
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % tiles.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [isPaused, tiles.length]);

    const activeTile = tiles[activeIdx] || tiles[0];
    const details = TILE_DETAILS[activeTile.tag] || {
        title: `${activeTile.tag} Excellence`,
        subtitle: "Bespoke strategy, creative engineering, and scalable momentum.",
    };

    const nextTile = () => setActiveIdx((activeIdx + 1) % tiles.length);
    const prevTile = () => setActiveIdx((activeIdx - 1 + tiles.length) % tiles.length);

    return (
        <section className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-between overflow-hidden text-brand-navy pt-20 sm:pt-24 md:pt-28" style={{ backgroundColor: "#fafaf8" }}>
            {/* ── Ambient Background Artwork & Fluid Light ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                {hero.backgroundImage && (
                    <Image
                        src={hero.backgroundImage}
                        alt=""
                        aria-hidden
                        fill
                        priority
                        className="object-cover object-center opacity-80 md:opacity-90 pointer-events-none"
                    />
                )}
                {/* Organic radial ambient glows for warmth and depth */}
                <div
                    className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full blur-3xl opacity-35 pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(244,162,97,0.7), rgba(230,57,70,0.3) 50%, transparent 75%)" }}
                />
                <div
                    className="absolute -bottom-24 -left-24 w-[550px] h-[550px] rounded-full blur-3xl opacity-25 pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(91,192,190,0.7), rgba(38,78,112,0.35) 50%, transparent 75%)" }}
                />
                {/* Architectural orbital geometry rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-black/[0.04] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full border border-black/[0.03] pointer-events-none" />
            </div>

            {/* ── Main Content Grid ── */}
            <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 md:px-12 py-6 sm:py-10 md:py-12 my-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    
                    {/* LEFT COLUMN: Monumental Typography & High-Converting CTAs (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col items-start">
                        
                        {/* Live Agency Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease }}
                            className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-black/10 bg-white/80 backdrop-blur-md shadow-sm mb-5 sm:mb-7"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-mono font-bold text-brand-navy/85">
                                {hero.eyebrow || "Digital Marketing Agency"}
                            </span>
                            <span className="hidden sm:inline-block w-px h-3 bg-black/15 mx-1" />
                            <span className="hidden sm:inline-block text-[9px] tracking-widest uppercase font-mono text-brand-navy/50">
                                Global Hubs · LK · OM · AU
                            </span>
                        </motion.div>

                        {/* Monumental Headline */}
                        <div className="font-black uppercase leading-[0.9] tracking-tighter mb-5 sm:mb-7 select-none">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease }}
                                className="flex items-center gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap"
                            >
                                <span className="block text-[clamp(2.3rem,7.5vw,6.8rem)] text-brand-navy drop-shadow-sm pb-[0.03em] break-words">
                                    {hero.line1}
                                </span>
                                <span className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border border-black/25 flex items-center justify-center shrink-0 text-brand-navy/70 text-xs sm:text-sm">
                                    ⊙
                                </span>
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.22, ease }}
                                className="block text-[clamp(2.3rem,7.5vw,6.8rem)] text-transparent relative pb-[0.03em] break-words"
                                style={{
                                    WebkitTextStroke: "2.5px #0a1128",
                                }}
                            >
                                {hero.line2}
                                <span className="text-[var(--brand-1)] drop-shadow-sm" style={{ WebkitTextStroke: "0px" }}>.</span>
                            </motion.span>
                        </div>

                        {/* Tagline & Slogan */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.35, ease }}
                            className="text-base sm:text-lg md:text-xl text-brand-navy/80 leading-relaxed max-w-xl mb-2 font-normal"
                        >
                            {hero.tagline}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.42, ease }}
                            className="text-[10px] sm:text-[11px] tracking-[0.28em] sm:tracking-[0.35em] uppercase font-mono text-brand-navy/55 mb-6 sm:mb-8"
                        >
                            {hero.slogan}
                        </motion.p>

                        {/* High-Converting Action CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease }}
                            className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-8 sm:mb-9 w-full sm:w-auto"
                        >
                            <button
                                onClick={() => navScrollTo("services")}
                                data-hover
                                className="group w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-brand-navy text-white text-[11px] sm:text-[12px] tracking-[0.28em] uppercase font-bold hover:bg-black transition-all duration-300 shadow-xl shadow-brand-navy/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 cursor-pointer sm:cursor-none"
                            >
                                <span>Explore Services</span>
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 text-xs">
                                    →
                                </span>
                            </button>

                            <button
                                onClick={() => navScrollTo("contact")}
                                data-hover
                                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full border border-brand-navy/35 hover:border-brand-navy text-brand-navy text-[11px] sm:text-[12px] tracking-[0.28em] uppercase font-bold hover:bg-white/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer sm:cursor-none shadow-sm hover:shadow active:scale-95"
                            >
                                <span>Start a Project</span>
                            </button>
                        </motion.div>

                        {/* Above-the-Fold Social Proof Metrics */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="pt-5 border-t border-brand-navy/15 grid grid-cols-3 gap-3 sm:gap-8 w-full max-w-lg"
                        >
                            <div>
                                <p className="text-lg sm:text-2xl font-black text-brand-navy tracking-tight">1,800+</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-brand-navy/55 font-mono mt-0.5">Satisfied Clients</p>
                            </div>
                            <div>
                                <p className="text-lg sm:text-2xl font-black text-brand-navy tracking-tight">3,200+</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-brand-navy/55 font-mono mt-0.5">Projects Delivered</p>
                            </div>
                            <div>
                                <p className="text-lg sm:text-2xl font-black text-brand-navy tracking-tight">03</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-brand-navy/55 font-mono mt-0.5">Global Hubs</p>
                            </div>
                        </motion.div>

                    </div>

                    {/* RIGHT COLUMN: Frosted Editorial Gallery Showcase (5 cols) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.25, ease }}
                        className="lg:col-span-5 relative w-full flex flex-col items-center pt-3 sm:pt-0"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Outer Showcase Wrapper with Non-Clipped Floating Badges */}
                        <div className="relative w-full max-w-[460px]">

                            {/* Floating Glassmorphic Metric Badge 1 (Top-Right) */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                                className="absolute -top-3 sm:-top-4 right-0 sm:-right-4 z-30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/95 text-brand-navy shadow-xl border border-black/10 backdrop-blur-md flex items-center gap-1.5 sm:gap-2 pointer-events-none"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">99.4% Success Rate</span>
                            </motion.div>

                            {/* Floating Glassmorphic Metric Badge 2 (Bottom-Left) */}
                            <motion.div
                                animate={{ y: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.8 }}
                                className="absolute -bottom-3 sm:-bottom-4 left-0 sm:-left-4 z-30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-brand-navy text-white shadow-xl border border-white/10 backdrop-blur-md flex items-center gap-1.5 sm:gap-2 pointer-events-none"
                            >
                                <span className="text-emerald-400 font-bold text-xs">↗</span>
                                <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">+240% Growth</span>
                            </motion.div>

                            {/* The Frosted Glass Gallery Frame */}
                            <div className="relative w-full rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 bg-white/75 backdrop-blur-xl border border-black/10 shadow-[0_25px_60px_-15px_rgba(10,17,40,0.12)]">
                                
                                {/* Photo Container with 16:11 aspect ratio */}
                                <div className="relative w-full aspect-[16/11] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 group">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeIdx}
                                            className="absolute inset-0"
                                            initial={{ opacity: 0, scale: 1.04 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            transition={{ duration: 0.55, ease }}
                                        >
                                            <Image
                                                src={activeTile.image || "/logo1.png"}
                                                alt={`eSupport — ${activeTile.tag}`}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="(max-width: 768px) 95vw, 460px"
                                                priority
                                            />
                                            {/* Clean gradient overlay for caption contrast */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Top Bar on Photo */}
                                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10 pointer-events-none">
                                        <div className="px-2.5 sm:px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-mono font-bold">
                                            {String(activeIdx + 1).padStart(2, "0")} — {activeTile.tag}
                                        </div>
                                        <div className="px-2.5 sm:px-3 py-1 rounded-full bg-white/25 backdrop-blur-md border border-white/25 text-white text-[9px] tracking-[0.2em] uppercase font-mono font-medium">
                                            eSupport · LK
                                        </div>
                                    </div>

                                    {/* Bottom Caption on Photo */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5 z-10 text-white pointer-events-none">
                                        <p className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-md">
                                            {details.title}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 leading-relaxed mt-0.5">
                                            {details.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Interactive Control Bar underneath photo */}
                                <div className="flex items-center justify-between pt-2.5 sm:pt-3 px-1 sm:px-1.5">
                                    {/* Slide Progress / Indicators */}
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                        {tiles.slice(0, 8).map((t, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveIdx(i)}
                                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                    activeIdx === i ? "w-5 sm:w-6 bg-brand-navy" : "w-1.5 bg-black/15 hover:bg-black/40"
                                                }`}
                                                aria-label={`View ${t.tag}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Next / Prev Controls */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={prevTile}
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 hover:bg-brand-navy hover:text-white text-brand-navy flex items-center justify-center text-xs transition-all duration-200 active:scale-90 cursor-none"
                                            aria-label="Previous slide"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={nextTile}
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 hover:bg-brand-navy hover:text-white text-brand-navy flex items-center justify-center text-xs transition-all duration-200 active:scale-90 cursor-none"
                                            aria-label="Next slide"
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Service Quick-Selector Tabs underneath card */}
                            <div className="flex flex-wrap justify-center gap-1.5 mt-3 sm:mt-4">
                                {tiles.slice(0, 5).map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIdx(i)}
                                        className={`px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-wider uppercase font-mono transition-all duration-200 cursor-none ${
                                            activeIdx === i
                                                ? "bg-brand-navy text-white shadow-sm"
                                                : "bg-white/80 hover:bg-white text-brand-navy/70 border border-black/10"
                                        }`}
                                    >
                                        {t.tag}
                                    </button>
                                ))}
                            </div>

                        </div>
                    </motion.div>

                </div>
            </div>

            {/* ── Bottom Meta Bar & Natural Scroll Prompt ── */}
            <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 md:px-12 py-3 sm:py-3.5 border-t border-black/10 bg-white/70 backdrop-blur-md text-brand-navy text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-mono gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="hidden sm:inline shrink-0">Operational in</span>
                    <span className="truncate max-w-[140px] sm:max-w-none">Colombo · Dubai · Melbourne</span>
                </div>
                <button
                    onClick={() => navScrollTo("velocityTicker")}
                    className="flex items-center gap-1.5 sm:gap-2 hover:opacity-60 active:opacity-40 transition-opacity cursor-pointer sm:cursor-none shrink-0"
                >
                    <span className="hidden sm:inline">Scroll to explore</span>
                    <span className="animate-bounce">↓</span>
                </button>
                <span className="opacity-60 truncate max-w-[90px] sm:max-w-none text-right shrink-0">{hero.metaRight || "Colombo, LK · 2026"}</span>
            </div>
        </section>
    );
}


/* ══════════════════════════════════════════════════════════════════════════
   VELOCITY TICKER
   ══════════════════════════════════════════════════════════════════════════ */
function VelocityTicker() {
    const { tickers } = useContent();
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    const smooth = useSpring(velocity, { stiffness: 50, damping: 22 });
    const skewX = useTransform(smooth, [-3000, 0, 3000], ["8deg", "0deg", "-8deg"]);
    const scaleY = useTransform(smooth, [-3000, 0, 3000], [0.85, 1, 0.85]);

    return (
        <motion.div className="border-y border-brand-navy/10 py-5 overflow-hidden bg-brand-navy/[0.02]" style={{ skewX, scaleY }}>
            <div className="flex gap-12 animate-[marquee_22s_linear_infinite] whitespace-nowrap">
                {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="text-[11px] tracking-[0.4em] uppercase text-brand-navy/55 flex items-center gap-12 font-bold">
                        {tickers.top.map((item, j) => (
                            <span key={j} className="flex items-center gap-12">
                                <span style={{ color: accentAt(j) }}>{item}</span>
                                <span className="text-brand-navy/20">✦</span>
                            </span>
                        ))}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   AGENCY BRIDGE — intro section directly after hero
   ══════════════════════════════════════════════════════════════════════════ */

function AgencyBridge() {
    const { agency } = useContent();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const lineW = useTransform(scrollYProgress, [0.05, 0.55], ["0%", "100%"]);

    return (
        <section ref={ref} className="px-5 sm:px-8 md:px-14 py-20 sm:py-28 md:py-44 border-b border-brand-navy/10 overflow-hidden relative" style={{ backgroundColor: LIGHT_BG }}>
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 50% at 75% 50%, rgba(255,107,53,0.05), transparent)" }} />

            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center mb-14 md:mb-28">
                    {/* Left: headline */}
                    <div>
                        <motion.div 
                            className="overflow-hidden mb-3"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.p
                                className="text-[10px] tracking-[0.6em] uppercase text-brand-navy/40"
                                variants={{
                                    hidden: { y: "110%" },
                                    visible: { y: "0%", transition: { duration: 0.8, ease } }
                                }}
                            >
                                {agency.eyebrow}
                            </motion.p>
                        </motion.div>
                        <motion.div 
                            className="overflow-hidden"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.h2
                                className="text-[clamp(2.3rem,8vw,7rem)] font-black uppercase tracking-tighter leading-[0.9] mb-6 md:mb-8"
                                variants={{
                                    hidden: { y: "105%" },
                                    visible: { y: "0%", transition: { duration: 1, ease, delay: 0.08 } }
                                }}
                            >
                                {agency.title}<br />
                                <span style={{ color: "var(--brand-1)" }}>{agency.titleAccent}</span>
                            </motion.h2>
                        </motion.div>
                        <FadeUp delay={0.25}>
                            <p className="text-sm sm:text-base text-brand-navy/60 leading-relaxed max-w-md">
                                {agency.body}
                            </p>
                        </FadeUp>
                    </div>

                    {/* Right: animated stats grid */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-8">
                        {agency.stats.map((st, i) => ({ n: st.value, l: st.label, c: [BRAND_COLORS[0], BRAND_COLORS[3], BRAND_COLORS[1], BRAND_COLORS[2]][i % 4] })).map((s, i) => (
                            <FadeUp key={i} delay={0.1 + i * 0.09}>
                                <div className="border-t-2 pt-4 sm:pt-5" style={{ borderColor: s.c }}>
                                    <p className="text-3xl sm:text-4xl md:text-5xl font-black leading-none mb-2" style={{ color: s.c }}>{s.n}</p>
                                    <p className="text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-brand-navy/50">{s.l}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>

                {/* Brand gradient rule */}
                <div className="relative h-px bg-brand-navy/10 mb-8 sm:mb-12 overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0"
                        style={{ width: lineW, background: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3), var(--brand-4), var(--brand-5))" }}
                    />
                </div>

                {/* Service tags */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {agency.tags.map((tag, i) => (
                        <FadeUp key={i} delay={i * 0.05}>
                            <motion.span
                                data-hover
                                className="inline-block px-3.5 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase border cursor-pointer sm:cursor-none active:scale-95"
                                style={{ borderColor: BRAND_COLORS[i % BRAND_COLORS.length], color: BRAND_COLORS[i % BRAND_COLORS.length] }}
                                whileHover={{ scale: 1.07, y: -3 }}
                                transition={{ duration: 0.2 }}
                            >
                                {tag}
                            </motion.span>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   PARALLAX IMAGE GALLERY
   ══════════════════════════════════════════════════════════════════════════ */
/* Four columns with different parallax speeds; images are dealt round-robin. */
const GALLERY_MOTION = [
    { speed: 0.22, startY: -80 },
    { speed: 0.55, startY: -200 },
    { speed: 0.35, startY: -55 },
    { speed: 0.68, startY: -150 },
];

type GalleryCol = (typeof GALLERY_MOTION)[number] & { images: { image: string; label: string }[] };

function GalleryColumn({
                           col, idx, progress,
                       }: {
    col: GalleryCol;
    idx: number;
    progress: MotionValue<number>;
}) {
    const rawY = useTransform(progress, [0, 1], [col.startY, col.startY - 340 * col.speed]);
    const y = useSpring(rawY, { stiffness: 60, damping: 22 });

    return (
        <motion.div className={`flex-1 min-w-0 will-change-transform ${idx >= 2 ? "hidden sm:block" : "block"}`} style={{ y }}>
            <motion.div
                className="flex flex-col gap-[6px]"
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.3, delay: idx * 0.1, ease }}
            >
                {col.images.map((img, i) => (
                    <div
                        key={i}
                        className="w-full relative overflow-hidden group bg-brand-navy"
                        style={{ aspectRatio: "2/3" }}
                    >
                        <Image
                            src={img.image || "/logo1.png"}
                            alt={img.label}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-brand-navy/30 group-hover:bg-brand-navy/10 transition-colors duration-500" />
                        <span className="absolute bottom-2.5 left-3 z-10 text-[8px] tracking-[0.3em] uppercase text-white/50 font-mono select-none">
                            {img.label}
                        </span>
                        <div
                            className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ backgroundColor: BRAND_COLORS[(idx + i) % BRAND_COLORS.length] }}
                        />
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}

function ParallaxGallery() {
    const { gallery } = useContent();
    const columns: GalleryCol[] = GALLERY_MOTION.map((m, c) => ({ ...m, images: gallery.images.filter((_, i) => i % GALLERY_MOTION.length === c) }));
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const titleY = useTransform(scrollYProgress, [0, 1], ["50%", "-50%"]);
    const titleOpacity = useTransform(scrollYProgress, [0.08, 0.25, 0.72, 0.9], [0, 1, 1, 0]);

    return (
        <section id="portfolio" ref={ref} className="relative bg-brand-navy overflow-hidden py-12 md:py-24">
            <motion.div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none text-center px-4"
                style={{ y: titleY, opacity: titleOpacity }}
            >
                <p className="text-[10px] tracking-[0.65em] uppercase text-white/30 mb-4 font-mono">{gallery.eyebrow}</p>
                <h2 className="text-[clamp(2.5rem,11vw,11rem)] font-black uppercase tracking-tighter leading-none text-white drop-shadow-[0_4px_60px_rgba(0,0,0,1)]">
                    {gallery.title}
                </h2>
                <p className="mt-4 sm:mt-5 text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.5em] uppercase text-white/35">
                    {gallery.words.map((w, i) => (
                        <span key={i}>
                            {i > 0 && " · "}
                            <span style={{ color: [BRAND_COLORS[0], BRAND_COLORS[2], BRAND_COLORS[3]][i % 3] }}>{w}</span>
                        </span>
                    ))}
                </p>
            </motion.div>

            <div
                className="absolute inset-0 z-[5] pointer-events-none"
                style={{ background: "radial-gradient(ellipse 55% 65% at 50% 50%, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
            />
            <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-black/70 via-transparent to-black/70" />

            <div className="flex gap-[6px] px-[6px] h-[95vh] sm:h-[120vh] md:h-[145vh]">
                {columns.map((col, i) => (
                    <GalleryColumn key={i} col={col} idx={i} progress={scrollYProgress} />
                ))}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   EDITORIAL PIN — cross-fade sequence
   ══════════════════════════════════════════════════════════════════════════ */

function EditorialPin() {
    const { editorial } = useContent();
    const EDITORIAL = editorial.slides.map((sl, i) => ({
        num: pad2(i + 1),
        title: sl.title,
        sub: sl.subtitle,
        desc: sl.description,
        img: sl.image || "/logo1.png",
        accent: accentAt(i),
    }));
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        return scrollYProgress.on("change", v => {
            setActiveIdx(Math.min(Math.floor(v * EDITORIAL.length * 0.9999), EDITORIAL.length - 1));
        });
    }, [scrollYProgress, EDITORIAL.length]);

    if (!EDITORIAL.length) return null;

    return (
        <section ref={ref} className="relative" style={{ height: `${Math.max(EDITORIAL.length, 1) * 115}vh` }}>
            <div className="sticky top-0 h-screen h-[100dvh] overflow-hidden bg-brand-navy">

                {EDITORIAL.map((s, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0"
                        style={{ pointerEvents: i === activeIdx ? "auto" : "none" }}
                    >
                        {/* Full-bleed image with parallax & scale transition */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                scale: i === activeIdx ? 1 : 1.1,
                                opacity: i === activeIdx ? 1 : 0
                            }}
                            transition={{ duration: 1.2, ease }}
                        >
                            <Image src={s.img} alt={s.title} fill className="object-cover" sizes="100vw" preload={i === 0} />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                        {/* Subtle brand colour tint */}
                        <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundColor: s.accent }} />

                        {/* Chapter label — top-left */}
                        <div className="absolute top-20 md:top-24 left-5 md:left-16 z-10">
                            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-mono text-white/50">
                                {s.num} / {String(EDITORIAL.length).padStart(2, "0")} — <span style={{ textTransform: "none" }}>eSupport</span>
                            </p>
                        </div>

                        {/* Bottom content — slides up when this slide becomes active */}
                        <motion.div
                            className="absolute inset-x-0 bottom-0 z-10 flex flex-col md:flex-row md:items-end justify-between p-5 pb-8 sm:p-10 md:p-16 gap-4"
                            animate={{ y: i === activeIdx ? 0 : 24, opacity: i === activeIdx ? 1 : 0 }}
                            transition={{ duration: 0.55, ease, delay: i === activeIdx ? 0.12 : 0 }}
                        >
                            <div>
                                {/* Accent bar — scales in when active */}
                                <motion.div
                                    className="h-[3px] mb-4 sm:mb-7 origin-left"
                                    style={{ backgroundColor: s.accent, width: 80 }}
                                    animate={{ scaleX: i === activeIdx ? 1 : 0 }}
                                    transition={{ duration: 0.5, ease, delay: i === activeIdx ? 0.28 : 0 }}
                                />
                                <motion.p
                                    className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.55em] uppercase text-white/60 mb-2 sm:mb-4 font-mono"
                                    animate={{ opacity: i === activeIdx ? 1 : 0, x: i === activeIdx ? 0 : -10 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    {s.sub.split("eSupport").map((part, i, arr) =>
                                        i < arr.length - 1
                                             ? <span key={i}>{part}<span style={{ textTransform: "none" }}>eSupport</span></span>
                                            : <span key={i}>{part}</span>
                                    )}
                                </motion.p>
                                <motion.h2
                                    className="text-[clamp(2.2rem,8.5vw,9rem)] font-black uppercase tracking-tighter leading-none text-white"
                                    animate={{ opacity: i === activeIdx ? 1 : 0, y: i === activeIdx ? 0 : 20 }}
                                    transition={{ duration: 0.8, delay: 0.1 }}
                                >
                                    {s.title}
                                </motion.h2>
                                {s.desc && (
                                    <p className="mt-3 text-xs text-white/50 leading-relaxed max-w-sm line-clamp-2 md:hidden">
                                        {s.desc}
                                    </p>
                                )}
                            </div>
                            <div className="text-right hidden md:block max-w-xs">
                                <p className="text-sm text-white/45 leading-relaxed mb-6">{s.desc}</p>
                                <p className="text-[10px] tracking-[0.4em] uppercase font-mono" style={{ color: s.accent }}>
                                    {s.num} / {String(EDITORIAL.length).padStart(2, "0")}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}

                {/* Side progress bars — above all slides */}
                <div className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3 z-20">
                    {EDITORIAL.map((ed, i) => (
                        <motion.div
                            key={i}
                            className="rounded-full"
                            style={{ backgroundColor: ed.accent, width: 3 }}
                            animate={{ height: i === activeIdx ? 36 : 12, opacity: i === activeIdx ? 1 : 0.35 }}
                            transition={{ duration: 0.35, ease }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   CULTURE PIN
   ══════════════════════════════════════════════════════════════════════════ */
function CulturePin() {
    const { culture } = useContent();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

    const theOpacity = useTransform(scrollYProgress, [0, 0.15, 0.6, 0.78], [0, 1, 1, 0]);
    const theScale = useTransform(scrollYProgress, [0, 0.2], [0.7, 1]);
    const theX = useTransform(scrollYProgress, [0, 0.5, 0.78], ["0%", "0%", "-30%"]);

    const agencyOpacity = useTransform(scrollYProgress, [0.18, 0.38, 0.6, 0.78], [0, 1, 1, 0]);
    const agencyY = useTransform(scrollYProgress, [0.18, 0.38], ["60px", "0px"]);
    const agencyX = useTransform(scrollYProgress, [0.18, 0.5, 0.78], ["0%", "0%", "30%"]);

    const lineScaleX = useTransform(scrollYProgress, [0.38, 0.58], [0, 1]);
    const subOpacity = useTransform(scrollYProgress, [0.45, 0.62, 0.7, 0.78], [0, 1, 1, 0]);

    const gridOpacity = useTransform(scrollYProgress, [0, 0.2, 0.7, 0.8], [0, 0.5, 0.5, 0]);
    const ambientOpacity = useTransform(scrollYProgress, [0, 0.1, 0.7, 0.8], [0, 1, 1, 0]);

    return (
        <section ref={ref} className="relative h-[180vh] md:h-[280vh]" style={{ backgroundColor: LIGHT_BG }}>
            <div className="sticky top-0 h-screen h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        opacity: ambientOpacity,
                        background: "radial-gradient(circle at 50% 50%, rgba(255,107,53,0.06), rgba(230,57,70,0.04) 40%, transparent 65%)",
                    }}
                />
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        opacity: gridOpacity,
                        backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />

                <div className="relative z-10 text-center select-none text-brand-navy max-w-full">
                    <motion.p
                        className="font-black uppercase leading-none tracking-tighter text-[clamp(2.5rem,15vw,10rem)] md:text-[17vw] break-words"
                        style={{ opacity: theOpacity, scale: theScale, x: theX }}
                    >
                        {culture.word1}
                    </motion.p>
                    <motion.p
                        className="font-black uppercase leading-none tracking-tighter text-[clamp(2.5rem,15vw,10rem)] md:text-[17vw] break-words -mt-2 sm:-mt-3"
                        style={{
                            opacity: agencyOpacity,
                            y: agencyY,
                            x: agencyX,
                            backgroundImage: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {culture.word2}
                    </motion.p>
                    <motion.div className="h-[2px] my-6 sm:my-8 origin-center" style={{ scaleX: lineScaleX, background: "linear-gradient(90deg, var(--brand-1), var(--brand-4))" }} />
                    <motion.p className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.5em] uppercase text-brand-navy/55 px-2" style={{ opacity: subOpacity }}>
                        {culture.caption}
                    </motion.p>
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   WORK INTRO
   ══════════════════════════════════════════════════════════════════════════ */
function WorkIntro() {
    const { workIntro } = useContent();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const lineW = useTransform(scrollYProgress, [0.1, 0.55], ["0%", "100%"]);
    const taglineX = useTransform(scrollYProgress, [0.2, 0.7], ["2%", "-2%"]);

    return (
        <section ref={ref} className="bg-brand-navy text-white py-20 sm:py-28 md:py-52 px-5 sm:px-8 overflow-hidden border-t border-white/10">
            <div className="max-w-7xl mx-auto">
                <div className="relative h-px bg-white/10 mb-10 sm:mb-20 overflow-hidden">
                    <motion.div className="absolute inset-y-0 left-0" style={{ width: lineW, background: "linear-gradient(90deg, var(--brand-1), var(--brand-2))" }} />
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-end">
                    <div>
                        <FadeUp>
                            <p className="text-[10px] sm:text-[11px] tracking-[0.5em] sm:tracking-[0.6em] uppercase text-white/50 mb-6 sm:mb-10 font-mono">{workIntro.eyebrow}</p>
                        </FadeUp>
                        <motion.div 
                            className="overflow-hidden"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.h2
                                className="text-[clamp(2.3rem,10.5vw,11rem)] font-black uppercase leading-none tracking-tighter text-white"
                                variants={{
                                    hidden: { y: "105%" },
                                    visible: { y: "0%", transition: { duration: 1, ease } }
                                }}
                            >
                                {workIntro.line1}
                            </motion.h2>
                        </motion.div>
                        <motion.div 
                            className="overflow-hidden"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.h2
                                className="text-[clamp(2.3rem,10.5vw,11rem)] font-black uppercase leading-none tracking-tighter"
                                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)", color: "transparent" }}
                                variants={{
                                    hidden: { y: "105%" },
                                    visible: { y: "0%", transition: { duration: 1, delay: 0.15, ease } }
                                }}
                            >
                                {workIntro.line2}
                            </motion.h2>
                        </motion.div>
                    </div>

                    <div className="md:pb-4">
                        <FadeUp delay={0.2}>
                            <p className="text-sm md:text-base text-white/50 leading-relaxed mb-6 sm:mb-10 max-w-sm">
                                {workIntro.body}
                            </p>
                        </FadeUp>
                        <motion.p
                            className="text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/30"
                            style={{ x: taglineX }}
                        >
                            {workIntro.tagline}
                        </motion.p>
                    </div>
                </div>

                <div className="relative h-px bg-white/10 mt-10 sm:mt-20 overflow-hidden">
                    <motion.div className="absolute inset-y-0 right-0" style={{ width: lineW, background: "linear-gradient(90deg, var(--brand-4), var(--brand-5))" }} />
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   SERVICES
   ══════════════════════════════════════════════════════════════════════════ */

function Services() {
    const { services } = useContent();
    const SERVICES = services.items.map((it, i) => ({ num: pad2(i + 1), name: it.name, desc: it.desc, accent: accentAt(i) }));
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const titleX = useTransform(scrollYProgress, [0, 1], ["-1.5%", "1.5%"]);

    return (
        <section ref={ref} className="bg-brand-navy text-white py-20 sm:py-28 md:py-36 px-5 sm:px-8 border-t border-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-12 sm:mb-20 flex-wrap gap-4">
                    <div>
                        <FadeUp>
                            <p className="text-[10px] tracking-[0.6em] uppercase text-white/30 mb-3">{services.eyebrow}</p>
                        </FadeUp>
                        <motion.h2
                            className="text-[clamp(2.3rem,8vw,7rem)] font-black uppercase tracking-tighter leading-none"
                            style={{ x: titleX }}
                        >
                            <FadeUp>{services.title}</FadeUp>
                        </motion.h2>
                    </div>
                    <FadeUp delay={0.2}>
                        <p className="text-sm text-white/35 max-w-xs text-right hidden md:block">
                            {services.subtitle}
                        </p>
                    </FadeUp>
                </div>

                <div className="divide-y divide-white/10 border-t border-white/10">
                    {SERVICES.map((s, i) => (
                        <FadeUp key={s.num} delay={i * 0.07}>
                            <motion.div
                                data-hover
                                className="group flex items-center justify-between py-5 sm:py-8 cursor-pointer sm:cursor-none active:bg-white/[0.03] transition-colors"
                                whileHover="hov"
                            >
                                <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
                                    <span className="text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/30 font-mono w-7 sm:w-8 shrink-0">{s.num}</span>
                                    <motion.h3
                                        className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight break-words"
                                        variants={{ hov: { x: 10 } }}
                                        transition={{ duration: 0.3, ease }}
                                    >
                                        {s.name}
                                    </motion.h3>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <p className="text-sm text-white/35 hidden lg:block max-w-xs text-right">{s.desc}</p>
                                    <motion.span
                                        className="text-lg sm:text-xl shrink-0"
                                        style={{ color: s.accent }}
                                        variants={{ hov: { x: 6, opacity: 1 } }}
                                        initial={{ opacity: 0.3 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        →
                                    </motion.span>
                                </div>
                            </motion.div>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   STICKY STACKED SERVICE PACKAGES
   ══════════════════════════════════════════════════════════════════════════ */
type PackageCard = { id: number; name: string; cat: string; price: string; features: string[]; bg: string; accent: string };

function StackedPackageCard({ pkg, index, total, progress, ctaLabel }: {
    pkg: PackageCard;
    ctaLabel: string;
    index: number;
    total: number;
    progress: MotionValue<number>;
}) {
    const range = 1 / total;
    const start = index * range;
    const end = start + range;

    const scale = useTransform(progress, [start, end], [1, 1 - (total - index) * 0.04]);
    const opacity = useTransform(progress, [start, end - 0.05, end], [1, 1, 0.7]);

    return (
        <div className="sticky" style={{ top: `${6 + index * 2.5}vh` }}>
            <motion.div
                data-hover
                className="relative min-h-[68vh] sm:min-h-[75vh] md:h-[80vh] w-full overflow-hidden border border-brand-navy/10 text-brand-navy shadow-sm"
                style={{ background: pkg.bg, scale, opacity, transformOrigin: "center top" }}
            >
                <span
                    className="absolute -top-4 -right-4 text-[12rem] sm:text-[20rem] md:text-[28rem] font-black leading-none select-none pointer-events-none opacity-[0.06]"
                    style={{ color: pkg.accent }}
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                <div
                    className="absolute top-0 right-0 w-[3px] h-full"
                    style={{ backgroundColor: pkg.accent }}
                />

                <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 md:p-16">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[9px] sm:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase text-brand-navy/50 mb-1.5">{pkg.cat}</p>
                            <p className="text-[11px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-brand-navy/60"><span style={{ textTransform: "none" }}>eSupport</span> · {new Date().getFullYear()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-brand-navy/50 mb-1">Pricing</p>
                            <p className="text-sm sm:text-base font-bold tracking-tight" style={{ color: pkg.accent }}>{pkg.price}</p>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-0">
                        <h3 className="text-[clamp(1.8rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.9] mb-6 sm:mb-8">
                            {pkg.name}
                        </h3>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex flex-wrap gap-3 sm:gap-6 text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-brand-navy/70">
                                {pkg.features.map((feat, fi) => (
                                    <span key={fi} className="flex items-center gap-2">
                                        {fi === 0 && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pkg.accent }} />}
                                        {feat}
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => navScrollTo("contact")} className="text-[10px] tracking-[0.4em] uppercase border-b pb-1 transition-colors cursor-pointer sm:cursor-none active:opacity-70 font-bold" style={{ borderColor: pkg.accent, color: pkg.accent }}>
                                {ctaLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function StackedPackages() {
    const { packages } = useContent();
    const PACKAGES: PackageCard[] = packages.items.map((p, i) => ({
        id: i,
        name: p.name,
        cat: p.category,
        price: p.price,
        features: p.features,
        accent: accentAt(i),
        bg: `linear-gradient(135deg,#fafaf8,color-mix(in srgb, ${accentAt(i)} 12%, #fafaf8))`,
    }));
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

    return (
        <section ref={ref} className="relative" style={{ backgroundColor: LIGHT_BG }}>
            <div className="sticky top-0 h-screen h-[100dvh] flex items-center pointer-events-none z-0">
                <div className="px-5 sm:px-8 md:px-14 w-full text-brand-navy">
                    <SectionLabel num="02" label={packages.label} className="mb-4" />
                    <FadeUp>
                        <h2 className="text-[clamp(2.3rem,7vw,6rem)] font-black uppercase tracking-tighter leading-[0.9]">
                            {lines(packages.title.replace(" ", "\n"))} <span className="text-brand-navy/30">/ {PACKAGES.length}</span>
                        </h2>
                    </FadeUp>
                </div>
            </div>

            <div className="relative z-10 pt-[22vh] sm:pt-[32vh] md:pt-[40vh]">
                {PACKAGES.map((p, i) => (
                    <StackedPackageCard
                        key={p.id}
                        pkg={p}
                        index={i}
                        total={PACKAGES.length}
                        progress={scrollYProgress}
                        ctaLabel={packages.ctaLabel}
                    />
                ))}
                <div className="h-[20vh] sm:h-[30vh]" />
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MANIFESTO — word-by-word reveal with brand color cycling
   ══════════════════════════════════════════════════════════════════════════ */

function ManifestoWord({
                           word, progress, i, total, color,
                       }: {
    word: string;
    progress: MotionValue<number>;
    i: number;
    total: number;
    color: string;
}) {
    const start = (i / total) * 0.85;
    const end = ((i + 0.7) / total) * 0.85;
    const opacity = useTransform(progress, [start, end], [0.1, 1]);
    const blur = useTransform(progress, [start, end], [10, 0]);
    const filter = useTransform(blur, b => `blur(${b}px)`);
    const scale = useTransform(progress, [start, end], [0.92, 1]);

    return (
        <motion.span
            style={{ opacity, filter, scale, color, display: "inline-block", transformOrigin: "left center" }}
        >
            {word}{" "}
        </motion.span>
    );
}

function ManifestoSection() {
    const { manifesto } = useContent();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.25"] });
    const words = manifesto.text.split(/\s+/).filter(Boolean);

    return (
        <section id="manifesto" ref={ref} className="px-5 sm:px-8 md:px-16 lg:px-24 py-20 sm:py-32 md:py-52 border-t border-brand-navy/10 relative text-brand-navy" style={{ backgroundColor: LIGHT_BG }}>
            <SectionLabel num="03" label={manifesto.label} className="mb-8 sm:mb-14" />

            <p className="text-[clamp(1.4rem,4.5vw,3.75rem)] font-black uppercase leading-[1.18] tracking-tight max-w-full md:max-w-[20ch]">
                {words.map((word, i) => (
                    <ManifestoWord
                        key={i}
                        word={word}
                        progress={scrollYProgress}
                        i={i}
                        total={words.length}
                        color={BRAND_COLORS[i % BRAND_COLORS.length]}
                    />
                ))}
            </p>

            <FadeUp delay={0.3} className="mt-10 sm:mt-16">
                <p className="text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-brand-navy/40 max-w-xs">
                    {manifesto.caption}
                </p>
            </FadeUp>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   BRAND SECTION — story + visual
   ══════════════════════════════════════════════════════════════════════════ */

function BrandSection() {
    const { about } = useContent();
    const ABOUT_PILLARS = [
        { title: "Mission", accent: BRAND_COLORS[0], text: about.mission },
        { title: "Vision", accent: BRAND_COLORS[3], text: about.vision },
    ].filter(p => p.text.trim());
    const onButton = () => {
        if (!about.buttonLink) return navScrollTo("manifesto");
        if (about.buttonLink.startsWith("#")) return navScrollTo(about.buttonLink.slice(1));
        window.location.href = about.buttonLink;
    };
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const esY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
    const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.05]);
    const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

    return (
        <section id="about" ref={ref} className="grid md:grid-cols-2 min-h-screen border-t border-brand-navy/10">
            <div className="text-brand-navy flex flex-col justify-center px-5 sm:px-10 md:px-14 py-16 sm:py-24 md:py-32 overflow-hidden relative border-r border-brand-navy/10" style={{ backgroundColor: LIGHT_BG }}>
                <SectionLabel num="04" label={about.label} className="mb-6 sm:mb-8" />
                <motion.div 
                    className="overflow-hidden"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                >
                    <motion.h2
                        className="text-[clamp(2.1rem,5vw,4.5rem)] font-black uppercase leading-none tracking-tighter mb-6 sm:mb-10"
                        variants={{
                            hidden: { y: "100%" },
                            visible: { y: "0%", transition: { duration: 1, ease } }
                        }}
                    >
                        {lines(about.title)}
                    </motion.h2>
                </motion.div>
                <FadeUp delay={0.2}>
                    <p className="text-sm md:text-base text-brand-navy/60 leading-relaxed max-w-md">
                        {about.body}
                    </p>
                </FadeUp>

                <FadeUp delay={0.3}>
                    <div className="mt-8 sm:mt-10 pl-4 sm:pl-6 border-l-2 max-w-md" style={{ borderColor: "var(--brand-1)" }}>
                        <p className="text-sm sm:text-base md:text-lg italic text-brand-navy/80 leading-snug">
                            &ldquo;{about.quote}&rdquo;
                        </p>
                        <p className="mt-2.5 text-[10px] tracking-[0.3em] uppercase text-brand-navy/50">— {about.quoteAuthor}</p>
                    </div>
                </FadeUp>

                <FadeUp delay={0.35}>
                    <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-xl">
                        {ABOUT_PILLARS.map(p => (
                            <div key={p.title}>
                                <div className="flex items-center gap-3 mb-2.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accent }} />
                                    <p className="text-[10px] tracking-[0.4em] uppercase font-bold" style={{ color: p.accent }}>{p.title}</p>
                                </div>
                                <p className="text-sm text-brand-navy/60 leading-relaxed">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </FadeUp>

                <FadeUp delay={0.4}>
                    <MagneticBtn onClick={onButton} className="mt-10 sm:mt-12 self-start px-6 sm:px-8 py-3.5 sm:py-4 border border-brand-navy text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.4em] uppercase hover:bg-brand-navy hover:text-white active:scale-95 transition-all duration-300 cursor-pointer sm:cursor-none">
                        {about.buttonLabel}
                    </MagneticBtn>
                </FadeUp>
            </div>

            <div className="relative overflow-hidden min-h-[420px] md:min-h-0 py-16 md:py-0 flex items-center justify-center bg-brand-navy">
                {about.image ? (
                    <motion.div
                        className="absolute inset-0 w-full h-full"
                        style={{ scale: imgScale, y: imgY }}
                    >
                        <Image
                            src={about.image}
                            alt="eSupport Digital Growth"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/60" />
                    </motion.div>
                ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: "#f5f3f0" }} />
                )}

                <motion.span
                    className={`absolute text-[18rem] md:text-[22rem] font-black uppercase leading-none select-none pointer-events-none will-change-transform z-10 ${
                        about.image ? "text-white/[0.08]" : "text-brand-navy/[0.04]"
                    }`}
                    style={{ y: esY }}
                >
                    ES
                </motion.span>

                <div className={`relative z-20 text-center px-6 py-10 sm:py-12 rounded-2xl mx-4 max-w-sm sm:max-w-md ${
                    about.image 
                        ? "text-white border border-white/15 bg-black/30 backdrop-blur-md shadow-2xl" 
                        : "text-brand-navy"
                }`}>
                    <p className="font-black uppercase tracking-tighter leading-none">
                        <span className="block text-[3rem] sm:text-[4rem] md:text-[4.8rem]">{about.visualLine1}</span>
                        <span className="block text-[2rem] sm:text-[2.4rem] my-1" style={{ color: "var(--brand-1)" }}>×</span>
                        <span className="block text-[3rem] sm:text-[4rem] md:text-[4.8rem]">{about.visualLine2}</span>
                    </p>
                    <p className={`mt-4 sm:mt-6 text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-mono ${
                        about.image ? "text-white/70" : "text-brand-navy/40"
                    }`}>
                        {about.visualCaption}
                    </p>

                    <div className={`absolute top-4 left-4 text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-mono leading-tight ${
                        about.image ? "text-white/70" : "text-brand-navy/50"
                    }`}>
                        6.9271°N<br />79.8612°E
                    </div>
                    <div className={`absolute bottom-4 right-4 text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-mono leading-tight text-right ${
                        about.image ? "text-white/70" : "text-brand-navy/50"
                    }`}>
                        <span style={{ textTransform: "none" }}>eSupport</span><br />LK · 2026
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATS
   ══════════════════════════════════════════════════════════════════════════ */
function useCounter(target: number, active: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) return;
        const start = performance.now();
        const duration = 2200;
        const update = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }, [active, target]);
    return count;
}

/* Static class names so Tailwind can see them; column count follows item count. */
const MD_COLS = ["md:grid-cols-1", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"] as const;
const mdCols = (n: number) => MD_COLS[Math.min(Math.max(n, 1), 4)];

type StatData = { value: number; suffix: string; label: string; sub: string; fill: number; accent: string };

function StatItem({ stat, delay, num, total }: { stat: StatData; delay: number; num: string; total: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const count = useCounter(stat.value, inView);

    return (
        <motion.div
            ref={ref}
            className="px-6 sm:px-10 md:px-14 py-12 sm:py-16 md:py-24 border-b md:border-b-0 md:border-r border-brand-navy/10 last:border-0 text-left relative overflow-hidden text-brand-navy"
            style={{ backgroundColor: LIGHT_BG }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease }}
        >
            <p className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-mono mb-4 sm:mb-6">{num} / {pad2(total)}</p>
            <p className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter tabular-nums leading-none" style={{ color: stat.accent }}>
                {count.toLocaleString("en-US")}{stat.suffix}
            </p>
            <p className="text-sm sm:text-base font-bold uppercase tracking-[0.15em] mt-5 sm:mt-6">{stat.label}</p>
            <p className="text-xs text-brand-navy/50 tracking-widest uppercase mt-1 mb-6 sm:mb-8">{stat.sub}</p>

            <div className="h-px w-full bg-brand-navy/10 relative overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ backgroundColor: stat.accent }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stat.fill}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, delay: delay + 0.5, ease }}
                />
            </div>
        </motion.div>
    );
}

function StatsSection() {
    const { stats } = useContent();
    const items: StatData[] = stats.items.map((s, i) => ({ ...s, accent: [BRAND_COLORS[0], BRAND_COLORS[3], BRAND_COLORS[2]][i % 3] }));
    return (
        <section className="border-y border-brand-navy/10" style={{ backgroundColor: LIGHT_BG }}>
            <div className="px-5 sm:px-8 md:px-14 pt-14 pb-8 md:pt-20 md:pb-10 text-brand-navy">
                <SectionLabel num="05" label={stats.label} className="mb-4 sm:mb-6" />
                <FadeUp delay={0.1}>
                    <p className="text-sm md:text-base text-brand-navy/50 leading-relaxed max-w-2xl">
                        {stats.intro}
                    </p>
                </FadeUp>
            </div>
            <div className={`grid grid-cols-1 ${mdCols(items.length)} divide-y md:divide-y-0 md:divide-x divide-black/10`}>
                {items.map((s, i) => (
                    <StatItem key={i} stat={s} delay={i * 0.15} num={pad2(i + 1)} total={items.length} />
                ))}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   LOCATIONS
   ══════════════════════════════════════════════════════════════════════════ */
function LocationsSection() {
    const { offices } = useContent();
    const OFFICES = offices.items.map((o, i) => ({
        ...o,
        accent: [BRAND_COLORS[0], BRAND_COLORS[1], BRAND_COLORS[3]][i % 3],
        tel: o.phone.replace(/[^\d+]/g, ""),
    }));
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const lineW = useTransform(scrollYProgress, [0.1, 0.6], ["0%", "100%"]);

    return (
        <section ref={ref} className="bg-brand-navy text-white py-20 sm:py-28 md:py-44 px-5 sm:px-8 border-t border-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <SectionLabel num="06" label={offices.label} className="mb-10 sm:mb-16 opacity-60" />

                {/* Animated rule */}
                <div className="relative h-px bg-white/10 mb-12 sm:mb-20 overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0"
                        style={{ width: lineW, background: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3), var(--brand-4), var(--brand-5))" }}
                    />
                </div>

                <div className={`grid grid-cols-1 ${mdCols(OFFICES.length)} divide-y md:divide-y-0 md:divide-x divide-white/10`}>
                    {OFFICES.map((office, i) => (
                        <FadeUp key={i} delay={i * 0.18}>
                            <motion.div
                                className="p-6 sm:p-8 md:p-12 relative group cursor-pointer sm:cursor-none active:bg-white/[0.02] transition-colors"
                                data-hover
                                whileHover="hov"
                            >
                                {/* Color accent top bar on hover */}
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-[2px] origin-left"
                                    style={{ backgroundColor: office.accent }}
                                    variants={{ hov: { scaleX: 1 } }}
                                    initial={{ scaleX: 0 }}
                                    transition={{ duration: 0.4, ease }}
                                />

                                <p
                                    className="text-[10px] tracking-[0.5em] uppercase font-mono mb-3"
                                    style={{ color: office.accent }}
                                >
                                    {office.tag}
                                </p>

                                <div className="overflow-hidden mb-2">
                                    <motion.h3
                                        className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter"
                                        variants={{ hov: { x: 6 } }}
                                        transition={{ duration: 0.3, ease }}
                                    >
                                        {office.city}
                                    </motion.h3>
                                </div>

                                <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.25em] mb-6 sm:mb-8">{office.country}</p>

                                {office.address && <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-2">{office.address}</p>}
                                {office.phone && (
                                    <a
                                        href={`tel:${office.tel}`}
                                        className="inline-block text-xs sm:text-sm font-mono tracking-wide text-white/60 hover:text-white active:text-white transition-colors mb-6 sm:mb-8"
                                    >
                                        {office.phone}
                                    </a>
                                )}

                                <p className="text-[10px] font-mono text-white/25 tracking-[0.2em]">{office.coords}</p>

                                <motion.span
                                    className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 text-xl sm:text-2xl opacity-20"
                                    style={{ color: office.accent }}
                                    variants={{ hov: { opacity: 0.8, x: -4 } }}
                                    transition={{ duration: 0.3 }}
                                >
                                    →
                                </motion.span>
                            </motion.div>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   REVERSE TICKER
   ══════════════════════════════════════════════════════════════════════════ */
function ReverseTicker() {
    const { tickers } = useContent();
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    const smooth = useSpring(velocity, { stiffness: 50, damping: 22 });
    const skewX = useTransform(smooth, [-3000, 0, 3000], ["-8deg", "0deg", "8deg"]);

    return (
        <motion.div className="border-b border-brand-navy/10 py-4 overflow-hidden bg-brand-navy/[0.02]" style={{ skewX }}>
            <div className="flex gap-12 animate-[marquee-reverse_18s_linear_infinite] whitespace-nowrap">
                {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="text-[10px] tracking-[0.5em] uppercase text-brand-navy/45 flex items-center gap-12 font-bold">
                        {tickers.bottom.map((word, j) => (
                            <span key={j} className="flex items-center gap-12">
                                <span style={{ color: accentAt(j) }}>{word}</span>
                                <span className="text-brand-navy/15">·</span>
                            </span>
                        ))}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   CATEGORIES
   ══════════════════════════════════════════════════════════════════════════ */
function Categories() {
    const { focusAreas } = useContent();
    const CATEGORIES = focusAreas.items.map((c, i) => {
        const accent = [BRAND_COLORS[0], BRAND_COLORS[1], BRAND_COLORS[3]][i % 3];
        return { ...c, desc: c.description, accent, bg: `linear-gradient(135deg,${LIGHT_BG},color-mix(in srgb, ${accent} 12%, ${LIGHT_BG}))` };
    });
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const titleX = useTransform(scrollYProgress, [0, 1], ["-2%", "2%"]);

    return (
        <section ref={ref} className="px-5 sm:px-8 py-20 sm:py-28 md:py-44 relative overflow-hidden text-brand-navy" style={{ backgroundColor: LIGHT_BG }}>
            <SectionLabel num="07" label={focusAreas.label} className="mb-6 sm:mb-8" />

            <motion.h2
                className="text-[clamp(2.3rem,8vw,9rem)] font-black uppercase tracking-tighter mb-12 sm:mb-16 md:mb-20 leading-[0.9]"
                style={{ x: titleX }}
            >
                <FadeUp>{lines(focusAreas.title)}</FadeUp>
            </motion.h2>

            <div className={`grid grid-cols-1 ${mdCols(CATEGORIES.length)} gap-4`}>
                {CATEGORIES.map((cat, i) => (
                    <FadeUp key={i} delay={i * 0.12}>
                        <motion.div
                            data-hover
                            className="relative overflow-hidden aspect-[4/5] group border border-brand-navy/10"
                            style={{ background: cat.bg }}
                            whileHover="hov"
                        >
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-[3px]"
                                style={{ backgroundColor: cat.accent }}
                                variants={{ hov: { scaleX: 1 } }}
                                initial={{ scaleX: 0.3 }}
                                transition={{ duration: 0.5, ease }}
                            />

                            <span
                                className="absolute top-4 sm:top-6 right-4 sm:right-6 text-[7rem] sm:text-[9rem] md:text-[10rem] font-black leading-none select-none pointer-events-none opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.18]"
                                style={{ color: cat.accent }}
                            >
                                {pad2(i + 1)}
                            </span>

                            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="text-[10px] tracking-[0.3em] uppercase text-brand-navy/50">{cat.count} projects</span>
                                    <span className="text-[10px] tracking-[0.3em] uppercase text-brand-navy/40 font-mono">{pad2(i + 1)}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] tracking-[0.3em] uppercase text-brand-navy/50 mb-2">{cat.desc}</p>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">{cat.name}</p>
                                    <div className="flex items-center justify-between">
                                        <motion.button
                                            onClick={() => navScrollTo("portfolio")}
                                            className="text-[11px] tracking-[0.4em] uppercase flex items-center gap-2 py-2"
                                            variants={{ hov: { x: 4 } }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            Explore <span style={{ color: cat.accent }}>→</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
                                style={{ backgroundColor: cat.accent }}
                                variants={{ hov: { scaleX: 1 } }}
                                initial={{ scaleX: 0 }}
                                transition={{ duration: 0.4, ease }}
                            />
                        </motion.div>
                    </FadeUp>
                ))}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
   ══════════════════════════════════════════════════════════════════════════ */
function Testimonials() {
    const { testimonials } = useContent();
    const TESTIMONIALS = testimonials.items.map((t, i) => ({ ...t, accent: [BRAND_COLORS[0], BRAND_COLORS[1], BRAND_COLORS[3]][i % 3] }));
    return (
        <section className="px-5 sm:px-8 md:px-14 py-20 sm:py-28 md:py-44 border-t border-brand-navy/10 text-brand-navy" style={{ backgroundColor: LIGHT_BG }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between flex-wrap gap-6 mb-12 sm:mb-16 md:mb-20">
                    <div>
                        <SectionLabel num="08" label={testimonials.label} className="mb-6 sm:mb-8" />
                        <motion.div className="overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <motion.h2
                                className="text-[clamp(2.3rem,8vw,7rem)] font-black uppercase tracking-tighter leading-[0.9]"
                                variants={{ hidden: { y: "100%" }, visible: { y: "0%", transition: { duration: 1, ease } } }}
                            >
                                {testimonials.title}<br /><span style={{ color: "var(--brand-1)" }}>{testimonials.titleAccent}</span>
                            </motion.h2>
                        </motion.div>
                    </div>
                    <FadeUp delay={0.2}>
                        <p className="text-sm text-brand-navy/50 max-w-xs leading-relaxed">
                            {testimonials.intro}
                        </p>
                    </FadeUp>
                </div>

                <div className={`grid grid-cols-1 ${mdCols(Math.min(TESTIMONIALS.length, 3))} border-t border-l border-brand-navy/10`}>
                    {TESTIMONIALS.map((t, i) => (
                        <FadeUp key={i} delay={(i % 3) * 0.12} className="border-r border-b border-brand-navy/10">
                            <motion.figure
                                data-hover
                                className="relative h-full p-6 sm:p-8 md:p-12 flex flex-col justify-between gap-8 sm:gap-12 overflow-hidden"
                                whileHover="hov"
                            >
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-[3px] origin-left"
                                    style={{ backgroundColor: t.accent }}
                                    variants={{ hov: { scaleX: 1 } }}
                                    initial={{ scaleX: 0.25 }}
                                    transition={{ duration: 0.5, ease }}
                                />
                                <div>
                                    <span className="block text-5xl sm:text-7xl font-black leading-none mb-3 sm:mb-4" style={{ color: t.accent }} aria-hidden>&ldquo;</span>
                                    <blockquote className="text-base sm:text-lg md:text-xl font-medium leading-snug text-brand-navy/80">
                                        {t.quote}
                                    </blockquote>
                                </div>
                                <figcaption className="flex items-end justify-between gap-4 pt-4">
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{t.name}</p>
                                        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-navy/50 mt-1">{t.company}</p>
                                    </div>
                                    <p className="text-[10px] tracking-[0.3em] uppercase font-mono text-right" style={{ color: t.accent }}>{t.service}</p>
                                </figcaption>
                            </motion.figure>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   CONTACT US — Full interactive inquiry form & direct desk channels
   Submissions arrive in Admin → Inbox
   ══════════════════════════════════════════════════════════════════════════ */
const CONTACT_SERVICES = [
    "Web & Mobile Development",
    "Digital Marketing & SEO",
    "Brand Architecture & Identity",
    "Creative & Video Reels",
    "Cloud & Software Engineering",
    "Strategy Consultation",
] as const;

function ContactSection() {
    const { contact, general } = useContent();
    const [state, formAction, pending] = useActionState(submitLeadAction, undefined);
    const [selectedService, setSelectedService] = useState<string>("");
    const [isDismissed, setIsDismissed] = useState(false);
    const [submittedWaUrl, setSubmittedWaUrl] = useState<string>("");
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const companyWhatsApp = general?.whatsappNumber?.replace(/\D/g, "") || "94707820810";
    const isSuccess = Boolean(state?.ok && !isDismissed);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formEl = e.currentTarget;
        const formData = new FormData(formEl);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const service = String(formData.get("service") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!phone) return;

        let waText = `*New Website Enquiry — eSupport Technology*\n\n` +
            `👤 *Name:* ${name}\n` +
            `📧 *Email:* ${email}\n` +
            `📱 *Phone / WhatsApp:* ${phone}\n`;

        if (service) {
            waText += `💼 *Service:* ${service}\n`;
        }

        if (message) {
            waText += `\n📝 *Project Details:*\n${message}`;
        }

        const waUrl = `https://wa.me/${companyWhatsApp}?text=${encodeURIComponent(waText)}`;
        setSubmittedWaUrl(waUrl);

        // Open WhatsApp directly during the user click gesture
        try {
            window.open(waUrl, "_blank", "noopener,noreferrer");
        } catch {
            // Popup blocker fallback handled in success screen
        }
    };

    return (
        <section
            id="contact"
            ref={ref}
            className="border-t border-brand-navy/10 px-5 sm:px-8 py-20 sm:py-28 md:py-36 relative overflow-hidden text-brand-navy"
            style={{ backgroundColor: LIGHT_BG }}
        >
            <motion.span
                className="absolute inset-0 flex items-center justify-center text-[clamp(6rem,22vw,24rem)] font-black uppercase leading-none select-none pointer-events-none text-brand-navy/[0.025]"
                style={{ y: bgY }}
            >
                {contact.bgWord || "CONTACT"}
            </motion.span>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                    {/* Left Column — Editorial Heading & Quick Channels */}
                    <div className="lg:col-span-5 text-left flex flex-col justify-between h-full">
                        <div>
                            <SectionLabel num="09" label={contact.label || "Contact Us"} className="mb-6 inline-flex" />
                            <div className="overflow-hidden">
                                <motion.h2
                                    className="text-[clamp(2.3rem,5.5vw,4.5rem)] font-black uppercase tracking-tighter leading-[0.92]"
                                    initial={{ y: "100%" }}
                                    whileInView={{ y: "0%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease }}
                                >
                                    {lines(contact.title)}
                                </motion.h2>
                            </div>
                            <FadeUp delay={0.15}>
                                <p className="text-sm md:text-base text-brand-navy/60 mt-6 mb-8 max-w-md tracking-wide leading-relaxed">
                                    {contact.body}
                                </p>
                            </FadeUp>

                            {/* Direct Connect Options */}
                            <FadeUp delay={0.25} className="space-y-3.5 my-6 sm:my-8">
                                {/* WhatsApp Direct */}
                                <a
                                    href={`https://wa.me/${companyWhatsApp}?text=Hello%20eSupport%20Technology,%20I'd%20like%20to%20discuss%20a%20project.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 rounded-xl border border-brand-navy/10 bg-white/70 hover:bg-white hover:border-emerald-500/40 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <span className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-brand-navy/50">WhatsApp Connect</div>
                                            <div className="text-sm font-semibold text-brand-navy flex items-center gap-2">
                                                (+94) 707 820 810
                                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium px-1.5 py-0.5 bg-emerald-50 rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Online
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-brand-navy/40 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">→</span>
                                </a>

                                {/* Direct Email */}
                                <a
                                    href="mailto:growth@esupport.lk"
                                    className="group flex items-center justify-between p-4 rounded-xl border border-brand-navy/10 bg-white/70 hover:bg-white hover:border-brand-navy/30 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <span className="w-10 h-10 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-brand-navy/50">Direct Desk</div>
                                            <div className="text-sm font-semibold text-brand-navy">growth@esupport.lk</div>
                                        </div>
                                    </div>
                                    <span className="text-brand-navy/40 group-hover:text-brand-navy group-hover:translate-x-1 transition-all">→</span>
                                </a>
                            </FadeUp>
                        </div>

                        {/* Location Hubs Footnote */}
                        <FadeUp delay={0.35} className="pt-6 border-t border-brand-navy/10 mt-6 lg:mt-8">
                            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-brand-navy/45 mb-2.5">
                                Global Delivery Hubs
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs font-medium text-brand-navy/70">
                                <span className="px-3 py-1 rounded-md bg-white border border-brand-navy/10 shadow-xs">Colombo · Sri Lanka</span>
                                <span className="px-3 py-1 rounded-md bg-white border border-brand-navy/10 shadow-xs">Dubai · UAE</span>
                                <span className="px-3 py-1 rounded-md bg-white border border-brand-navy/10 shadow-xs">Melbourne · Australia</span>
                            </div>
                        </FadeUp>
                    </div>

                    {/* Right Column — The Full Contact Form Card */}
                    <div className="lg:col-span-7">
                        <FadeUp delay={0.2}>
                            <div className="bg-white/95 backdrop-blur-md border border-brand-navy/10 rounded-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-left relative">
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, ease }}
                                        className="py-12 sm:py-16 text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                            ✓
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-navy mb-3">
                                            Enquiry Sent to WhatsApp!
                                        </h3>
                                        <p className="text-sm md:text-base text-brand-navy/70 max-w-md mx-auto leading-relaxed mb-6">
                                            {contact.successMessage || "Thank you! Your project details have been recorded and WhatsApp has been opened to connect with our team."}
                                        </p>
                                        {submittedWaUrl && (
                                            <a
                                                href={submittedWaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md mx-auto mb-8 cursor-pointer"
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                </svg>
                                                <span>Continue in WhatsApp</span>
                                            </a>
                                        )}
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setIsDismissed(true)}
                                                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-brand-navy hover:text-brand-navy/70 border-b border-brand-navy/30 pb-1 transition-colors cursor-pointer"
                                            >
                                                Send another enquiry →
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form action={formAction} onSubmit={handleFormSubmit} className="space-y-5">
                                        {/* Honeypot field — hidden from people, catches bots */}
                                        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                                        {/* Service Selection Pills */}
                                        <div>
                                            <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-brand-navy/60 mb-2.5 font-medium">
                                                What are you looking to achieve?
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {CONTACT_SERVICES.map(srv => {
                                                    const isSelected = selectedService === srv;
                                                    return (
                                                        <button
                                                            key={srv}
                                                            type="button"
                                                            onClick={() => setSelectedService(isSelected ? "" : srv)}
                                                            className={`text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer font-medium ${
                                                                isSelected
                                                                    ? "bg-brand-navy text-white shadow-xs"
                                                                    : "bg-brand-navy/[0.03] text-brand-navy/75 hover:bg-brand-navy/[0.08] hover:text-brand-navy border border-brand-navy/10"
                                                            }`}
                                                        >
                                                            {srv}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <input type="hidden" name="service" value={selectedService} />
                                        </div>

                                        {/* Name & Email */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="contact-name" className="block text-[11px] font-mono tracking-[0.2em] uppercase text-brand-navy/60 mb-1.5 font-medium">
                                                    Your Name <span className="text-brand-navy/40">*</span>
                                                </label>
                                                <input
                                                    id="contact-name"
                                                    type="text"
                                                    name="name"
                                                    required
                                                    placeholder="Alex Silva"
                                                    className="w-full bg-[#fafaf8] border border-brand-navy/15 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 rounded-lg px-4 py-3 text-sm text-brand-navy placeholder:text-brand-navy/30 transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="contact-email" className="block text-[11px] font-mono tracking-[0.2em] uppercase text-brand-navy/60 mb-1.5 font-medium">
                                                    Email Address <span className="text-brand-navy/40">*</span>
                                                </label>
                                                <input
                                                    id="contact-email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder={contact.placeholder || "alex@company.com"}
                                                    className="w-full bg-[#fafaf8] border border-brand-navy/15 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 rounded-lg px-4 py-3 text-sm text-brand-navy placeholder:text-brand-navy/30 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone / WhatsApp (Mandatory) */}
                                        <div>
                                            <label htmlFor="contact-phone" className="block text-[11px] font-mono tracking-[0.2em] uppercase text-brand-navy/60 mb-1.5 font-medium">
                                                Phone / WhatsApp Number <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <input
                                                id="contact-phone"
                                                type="tel"
                                                name="phone"
                                                required
                                                placeholder="+94 70 782 0810"
                                                className="w-full bg-[#fafaf8] border border-brand-navy/15 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 rounded-lg px-4 py-3 text-sm text-brand-navy placeholder:text-brand-navy/30 transition-all outline-none"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label htmlFor="contact-message" className="block text-[11px] font-mono tracking-[0.2em] uppercase text-brand-navy/60 mb-1.5 font-medium">
                                                Project Details / Message <span className="text-brand-navy/40">*</span>
                                            </label>
                                            <textarea
                                                id="contact-message"
                                                name="message"
                                                rows={4}
                                                required
                                                placeholder="Tell us about your project, goals, timeline, or requirements..."
                                                className="w-full bg-[#fafaf8] border border-brand-navy/15 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 rounded-lg px-4 py-3 text-sm text-brand-navy placeholder:text-brand-navy/30 transition-all outline-none resize-none"
                                            />
                                        </div>

                                        {state?.error && (
                                            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 tracking-wide flex items-center gap-2">
                                                <span>⚠</span>
                                                <span>{state.error}</span>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4">
                                            <MagneticBtn
                                                type="submit"
                                                disabled={pending}
                                                className="w-full sm:w-auto px-8 sm:px-10 py-4 min-h-[52px] bg-brand-navy text-white text-[11px] tracking-[0.3em] uppercase font-bold hover:bg-brand-navy/90 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
                                            >
                                                {pending ? (
                                                    <>
                                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Submitting…</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-emerald-400">
                                                            <svg className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                            </svg>
                                                        </span>
                                                        <span>Send via WhatsApp</span>
                                                        <span>→</span>
                                                    </>
                                                )}
                                            </MagneticBtn>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </div>
        </section>
    );
}
const Newsletter = ContactSection;

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════════════════ */
const isExternal = (href: string) => /^https?:\/\//i.test(href);

function Footer() {
    const { footer, general } = useContent();
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
    const massiveScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
    const massiveOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.05, 0.09, 0.14]);

    /* Same-page anchors scroll smoothly instead of jumping. */
    const onLink = (href: string) => (e: React.MouseEvent) => {
        const hash = href.startsWith("/#") ? href.slice(2) : href.startsWith("#") ? href.slice(1) : null;
        if (hash && window.location.pathname === "/") {
            e.preventDefault();
            navScrollTo(hash);
        }
    };

    return (
        <footer ref={ref} className="border-t border-brand-navy/10 px-5 sm:px-8 pt-16 sm:pt-20 md:pt-24 pb-0 relative overflow-hidden text-brand-navy" style={{ backgroundColor: LIGHT_BG }}>

            {/* ── Branches ── */}
            <FadeUp>
                <p className="text-[10px] tracking-[0.5em] uppercase mb-6 sm:mb-8" style={{ color: BRAND_COLORS[0] }}>{footer.branchesLabel}</p>
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pb-10 sm:pb-14 border-b border-brand-navy/10`}>
                    {footer.branches.map((b, i) => (
                        <div key={i}>
                            <p className="text-[10px] tracking-[0.4em] uppercase font-mono mb-2 opacity-40">{pad2(i + 1)}</p>
                            <p className="text-sm font-bold tracking-wide mb-1">{b.country}</p>
                            <p className="text-xs text-brand-navy/55 leading-relaxed whitespace-pre-line">{b.address}</p>
                        </div>
                    ))}
                </div>
            </FadeUp>

            {/* ── Contact ── */}
            <FadeUp delay={0.05}>
                <p className="text-[10px] tracking-[0.5em] uppercase mt-10 sm:mt-14 mb-6 sm:mb-8" style={{ color: BRAND_COLORS[1] }}>{footer.contactsLabel}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 pb-10 sm:pb-14 border-b border-brand-navy/10">
                    {footer.contacts.map((c, i) => (
                        <div key={i}>
                            <p className="text-xs font-bold tracking-wide mb-1">{c.label}</p>
                            <a
                                href={c.href || undefined}
                                className="text-xs text-brand-navy/55 hover:text-brand-navy transition-colors tracking-wide leading-relaxed flex items-start gap-1.5 break-all sm:break-normal"
                            >
                                <svg className="mt-0.5 shrink-0" width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    {c.href.startsWith("mailto:") ? (
                                        <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>
                                    ) : (
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    )}
                                </svg>
                                {c.detail}
                            </a>
                        </div>
                    ))}
                </div>
            </FadeUp>

            {/* ── Nav links + Social ── */}
            <FadeUp delay={0.1}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mt-10 sm:mt-14 mb-12 sm:mb-20">
                    {footer.navColumns.map((col, colIdx) => (
                        <div key={colIdx}>
                            <p className="text-[10px] tracking-widest uppercase mb-4 sm:mb-5" style={{ color: accentAt(colIdx) }}>{col.title}</p>
                            {col.links.map((link, li) => (
                                <a
                                    key={li}
                                    href={link.href || undefined}
                                    onClick={link.href ? onLink(link.href) : undefined}
                                    {...(isExternal(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    className="block text-xs text-brand-navy/60 hover:text-brand-navy py-1.5 transition-colors tracking-wide"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    ))}
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-4 sm:mb-5" style={{ color: BRAND_COLORS[3] }}>{footer.socialsLabel}</p>
                        {footer.socials.map((s, i) => (
                            <a
                                key={i}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-brand-navy/60 hover:text-brand-navy py-1.5 transition-colors tracking-wide"
                            >
                                {s.name}
                            </a>
                        ))}
                    </div>
                </div>
            </FadeUp>

            <FadeUp delay={0.15}>
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-brand-navy/10 gap-4 pb-10 sm:pb-14 text-center sm:text-left">
                    <Image src={general.footerLogo || "/logo1.png"} alt="eSupport" width={140} height={50} className="h-10 sm:h-11 w-auto object-contain" />
                    <p className="text-[10px] text-brand-navy/35 tracking-widest uppercase">{footer.copyright}</p>
                    <p className="text-[10px] text-brand-navy/35 tracking-widest uppercase">{footer.location}</p>
                </div>
            </FadeUp>

            {/* Massive background word + areas */}
            <motion.div
                className="overflow-hidden -mb-[2vw]"
                style={{ scale: massiveScale, opacity: massiveOpacity }}
            >
                <p className="text-[clamp(3.5rem,18vw,20vw)] font-black leading-[0.85] tracking-tighter text-center select-none whitespace-nowrap text-brand-navy">
                    {footer.bigWord}
                </p>
                <p className="text-center font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-brand-navy/50 pb-6 select-none whitespace-normal sm:whitespace-pre px-4" style={{ fontSize: "clamp(0.6rem, 2vw, 1.4rem)" }}>
                    {footer.areas.replace(/ · /g, "  ·  ")}
                </p>
            </motion.div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   GLOBAL SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 30 });
    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100]"
            style={{
                scaleX,
                background: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3), var(--brand-4), var(--brand-5))",
            }}
        />
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT — section order & visibility come from Admin → Sections & Order
   ══════════════════════════════════════════════════════════════════════════ */
const SECTION_COMPONENTS: Record<LayoutSectionKey, () => React.ReactNode> = {
    velocityTicker: VelocityTicker,
    agency: AgencyBridge,
    gallery: ParallaxGallery,
    workIntro: WorkIntro,
    portfolio: PortfolioShowcase,
    culture: CulturePin,
    servicesShowcase: ServicesSection,
    services: Services,
    packages: StackedPackages,
    manifesto: ManifestoSection,
    editorial: EditorialPin,
    about: BrandSection,
    stats: StatsSection,
    offices: LocationsSection,
    reverseTicker: ReverseTicker,
    focusAreas: Categories,
    testimonials: Testimonials,
    contact: Newsletter,
};

export default function HomeClient() {
    const { layout, general } = useContent();
    const introSkipped = useSyncExternalStore(subscribeToHash, hasSectionHash, noSectionHash);

    useSmoothScroll();

    /* Opened at a #section: jump straight there. Layout settles over the first moments (images, pinned
       sections), so re-aim a few times, unless the visitor starts scrolling first. */
    useEffect(() => {
        if (!introSkipped) return;
        const id = decodeURIComponent(window.location.hash.slice(1));
        let cancelled = false;
        const jump = () => {
            const target = document.getElementById(id);
            if (!cancelled && target) _lenis?.scrollTo(target, { immediate: true, offset: -90, force: true });
        };
        const stop = () => { cancelled = true; };
        const timers = [0, 250, 700, 1400].map(ms => setTimeout(jump, ms));
        window.addEventListener("wheel", stop, { once: true, passive: true });
        window.addEventListener("touchstart", stop, { once: true, passive: true });
        return () => {
            timers.forEach(clearTimeout);
            window.removeEventListener("wheel", stop);
            window.removeEventListener("touchstart", stop);
        };
    }, [introSkipped]);

    const whatsapp = general.whatsappNumber.replace(/\D/g, "");

    return (
        <>
            <Cursor />
            <ScrollProgress />

            {/* WhatsApp floating button */}
            {whatsapp && (
                <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hover
                    className="fixed bottom-5 right-5 z-[90] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full cursor-pointer shadow-lg active:scale-95 transition-transform"
                    style={{ backgroundColor: "#25D366" }}
                    aria-label="Chat on WhatsApp"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-7 sm:h-7">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.556 4.112 1.528 5.836L.057 23.998l6.304-1.456A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.36-.213-3.72.861.884-3.612-.234-.372A9.817 9.817 0 012.182 12c0-5.419 4.399-9.818 9.818-9.818 5.42 0 9.818 4.399 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
                    </svg>
                </a>
            )}

            <Navbar
                onPortfolio={() => navScrollTo("portfolio")}
                onAbout={() => navScrollTo("about")}
                onContact={() => navScrollTo("contact")}
            />

            <main className="text-brand-navy" style={{ backgroundColor: LIGHT_BG, fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,sans-serif" }}>
                <ModernHeroSection />
                {layout.sections.filter(s => s.visible).map(s => {
                    const Section = SECTION_COMPONENTS[s.key];
                    return Section ? <Section key={s.key} /> : null;
                })}
                <Footer />
            </main>
        </>
    );
}
