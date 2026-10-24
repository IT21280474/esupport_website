"use client";

import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
    MotionValue,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "./ContentImage";
import { useContent } from "./SiteContentProvider";

const ease = [0.76, 0, 0.24, 1] as const;

/* ══════════════════════════════════════════════════════════════════════════
   eSupport SERVICES SECTION
   Pattern: pinned section with scroll-synchronized name list + image swap

   How it works
   ────────────
   • Section is tall (e.g. 600vh). As the user scrolls, scrollYProgress moves
     0 → 1 across that distance.
   • The active service index is derived from progress (0..SERVICES.length-1).
   • Left column is a vertical list. The active item slides into the center
     "anchor" position, scales up, turns black. The others stay light gray.
   • Center column is a list of image-type labels (IMAGE / IMAGE & FILM / etc).
     Same scroll-synced highlight logic.
   • Right column has TWO stacked image cards that crossfade per service,
     each with its own brand-color gradient.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Brand palette — eSupport logo colors ─────────────────────────────────── */
const BRAND = {
    red:    "#E63946",
    orange: "#F4A261",
    yellow: "#F1C232",
    green:  "#2A9D8F",
    blue:   "#264E70",
    teal:   "#5BC0BE",
    white:  "#FFFFFF",
};

/* ── Service item shape — content comes from Admin → Services Showcase ──── */
const TINTS = [BRAND.red, BRAND.orange, BRAND.yellow, BRAND.green, BRAND.teal, BRAND.blue];

type ServiceItem = {
    name: string;
    type: string;
    img1: { src: string; tint: string; label: string };
    img2: { src: string; tint: string; label: string };
};

/* ── Single name in the left list ─────────────────────────────────────────── */
function ServiceName({
                         service, index, total, progress, isMobile,
                     }: {
    service: ServiceItem;
    index: number;
    total: number;
    progress: MotionValue<number>;
    isMobile: boolean;
}) {
    /* When this service is the "active" one, progress*total ≈ index */
    const distance = useTransform(progress, p => Math.abs(p * (total - 1) - index));

    const opacity = useTransform(distance, [0, 1, 3], [1, 0.25, 0.08]);
    const scale   = useTransform(distance, [0, 1, 3], [1, 0.88, 0.8]);
    const color   = useTransform(distance, [0, 0.5, 1], ["#0a0a0a", "#9ca3af", "#d4d4d8"]);
    const x       = useTransform(distance, [0, 1], [0, isMobile ? -10 : -20]);

    return (
        <motion.div
            className="font-black uppercase leading-[0.95] tracking-[-0.04em] cursor-default select-none"
            style={{
                fontSize: isMobile ? "clamp(1.6rem, 6.5vw, 2.6rem)" : "clamp(2.2rem, 6vw, 5.2rem)",
                opacity,
                scale,
                color,
                x,
                transformOrigin: "left center",
            }}
        >
            {service.name}
        </motion.div>
    );
}

/* ── Center column meta-label (changes per active service) ────────────────── */
function ServiceTypeLabel({
                              service, index, total, progress,
                          }: {
    service: ServiceItem;
    index: number;
    total: number;
    progress: MotionValue<number>;
}) {
    const distance = useTransform(progress, p => Math.abs(p * (total - 1) - index));
    const opacity  = useTransform(distance, [0, 1, 3], [1, 0.25, 0.1]);
    const color    = useTransform(distance, [0, 1], ["#0a0a0a", "#9ca3af"]);

    return (
        <motion.p
            className="text-[11px] tracking-[0.4em] uppercase font-mono"
            style={{ opacity, color }}
        >
            {service.type}
        </motion.p>
    );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
export default function ServicesSection() {
    const { servicesShowcase } = useContent();
    const SERVICES: ServiceItem[] = servicesShowcase.items.map((it, i) => ({
        name: it.name,
        type: it.type,
        img1: { src: it.image1 || "/logo1.png", tint: `${TINTS[i % TINTS.length]}99`, label: it.label1 },
        img2: { src: it.image2 || "/logo1.png", tint: `${TINTS[(i + 1) % TINTS.length]}99`, label: it.label2 },
    }));
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* Active index for image swap (snaps to whole numbers) */
    const [activeIdx, setActiveIdx] = useState(0);
    useEffect(() => {
        return scrollYProgress.on("change", v => {
            const idx = Math.min(SERVICES.length - 1, Math.max(0, Math.round(v * (SERVICES.length - 1))));
            setActiveIdx(idx);
        });
    }, [scrollYProgress, SERVICES.length]);

    const active = SERVICES[Math.min(activeIdx, SERVICES.length - 1)];

    /* Left list translateY — moves the whole list up so the active item lands
       in the center anchor zone */
    const listY = useTransform(
        scrollYProgress,
        [0, 1],
        isMobile
            ? [`${7}vh`, `${7 - (SERVICES.length - 1) * 5.5}vh`]
            : [`${28}vh`, `${28 - (SERVICES.length - 1) * 8}vh`]
    );
    const labelsY = useTransform(
        scrollYProgress,
        [0, 1],
        [`${28}vh`, `${28 - (SERVICES.length - 1) * 5}vh`]
    );

    if (!active) return null;

    return (
        <section
            ref={ref}
            id="services"
            className="relative bg-white text-black"
            style={{ height: `${SERVICES.length * (isMobile ? 65 : 90)}vh` }}
        >
            <div className="sticky top-0 h-screen h-[100dvh] overflow-hidden">

                {/* MAIN GRID — three columns on desktop, flex stack on mobile; clears fixed navbar */}
                <div className="absolute inset-0 pt-16 sm:pt-24 md:pt-28 pb-12 sm:pb-16 flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-4 md:gap-8 px-4 sm:px-8 md:px-12">

                    {/* ── LEFT: vertical name list ───────────────────────────────── */}
                    <div className="h-[25vh] sm:h-[30vh] md:h-auto md:col-span-5 relative overflow-hidden shrink-0">
                        {/* Center anchor crosshair line */}
                        <div className="absolute left-0 right-0 top-[10vh] md:top-[44vh] h-px bg-black/0 z-0 pointer-events-none" />

                        <motion.div
                            className="flex flex-col gap-[0.8vh] md:gap-[1.2vh]"
                            style={{ y: listY }}
                        >
                            {SERVICES.map((s, i) => (
                                <ServiceName
                                    key={s.name}
                                    service={s}
                                    index={i}
                                    total={SERVICES.length}
                                    progress={scrollYProgress}
                                    isMobile={isMobile}
                                />
                            ))}
                        </motion.div>
                    </div>

                    {/* ── CENTER: type labels list ──────────────────────────────── */}
                    <div className="hidden md:block col-span-3 relative overflow-hidden">
                        <motion.div
                            className="flex flex-col gap-[5vh]"
                            style={{ y: labelsY }}
                        >
                            {SERVICES.map((s, i) => (
                                <ServiceTypeLabel
                                    key={s.name}
                                    service={s}
                                    index={i}
                                    total={SERVICES.length}
                                    progress={scrollYProgress}
                                />
                            ))}
                        </motion.div>
                    </div>

                    {/* ── RIGHT: stacked image pair (crossfades per service) ───── */}
                    <div className="flex-1 md:flex-initial md:col-span-4 relative min-h-[180px] md:min-h-0">

                        {/* Image card 1 — top, slightly offset */}
                        <div className="absolute top-0 sm:top-2 md:top-[8vh] right-0 sm:right-2 md:right-0 w-[58%] sm:w-[50%] md:w-full max-w-[420px] aspect-[4/5] shadow-lg rounded-sm overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={`a-${activeIdx}`}
                                    className="absolute inset-0 overflow-hidden"
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                    transition={{ duration: 0.7, ease }}
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={active.img1.src}
                                            alt={active.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 60vw, 420px"
                                        />
                                    </div>
                                    <div
                                        className="absolute inset-0"
                                        style={{ background: `linear-gradient(155deg, ${active.img1.tint} 0%, transparent 60%)` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div className="absolute top-2.5 sm:top-4 left-3 sm:left-5 text-[8px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/90 font-mono">
                                        01 — {active.img1.label}
                                    </div>
                                    <div className="absolute bottom-2.5 sm:bottom-4 right-3 sm:right-5 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/70 font-mono">
                                        {String(activeIdx + 1).padStart(2, "0")}/{String(SERVICES.length).padStart(2, "0")}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Image card 2 — lower, offset to the left, overlaps */}
                        <div className="absolute top-[6vh] sm:top-[12vh] md:top-[36vh] left-0 sm:left-2 md:left-[-8%] w-[54%] sm:w-[48%] md:w-[88%] max-w-[380px] aspect-[5/4] shadow-md rounded-sm overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={`b-${activeIdx}`}
                                    className="absolute inset-0 overflow-hidden"
                                    initial={{ opacity: 0, y: 50, scale: 0.92 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -40, scale: 0.92 }}
                                    transition={{ duration: 0.7, ease, delay: 0.08 }}
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={active.img2.src}
                                            alt={`${active.name} detail`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 55vw, 380px"
                                        />
                                    </div>
                                    <div
                                        className="absolute inset-0"
                                        style={{ background: `linear-gradient(135deg, ${active.img2.tint} 0%, transparent 60%)` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div className="absolute top-2.5 sm:top-4 left-3 sm:left-5 text-[8px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/90 font-mono">
                                        02 — {active.img2.label}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Bottom progress bar — tracks scroll across the section */}
                <div className="absolute bottom-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-8 md:px-12 py-2.5 sm:py-5 border-t border-black/10 bg-white/90 backdrop-blur-md">
                    <span className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.4em] uppercase opacity-50 font-bold truncate max-w-[95px] sm:max-w-none">
                        {servicesShowcase.bottomLeft}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {SERVICES.map((_, i) => (
                            <motion.span
                                key={i}
                                className="h-px"
                                animate={{
                                    width: i === activeIdx ? (isMobile ? 18 : 32) : (isMobile ? 6 : 12),
                                    backgroundColor: i === activeIdx ? "#0a0a0a" : "#d4d4d8",
                                }}
                                transition={{ duration: 0.4, ease }}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.4em] uppercase opacity-50 font-bold truncate max-w-[95px] sm:max-w-none text-right">
                        {servicesShowcase.bottomRight}
                    </span>
                </div>

                {/* Brand color spectrum strip — bottom-most accent */}
                <div className="absolute top-[54px] sm:top-20 left-0 right-0 h-[2px] z-20 pointer-events-none">
                    <div className="h-full w-full"
                         style={{
                             background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.orange}, ${BRAND.yellow}, ${BRAND.green}, ${BRAND.teal}, ${BRAND.blue})`,
                             opacity: 0.8,
                         }}
                    />
                </div>
            </div>
        </section>
    );
}
