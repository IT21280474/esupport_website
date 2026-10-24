"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Image from "./ContentImage";
import VideoLightbox from "./VideoLightbox";
import {
    PORTFOLIO_VIDEOS,
    VIDEO_CATEGORIES,
    normalizeVideoReels,
    type PortfolioVideo,
    type VideoCategory,
} from "../data/portfolio-videos";

const ease = [0.76, 0, 0.24, 1] as const;
const pad2 = (n: number) => String(n).padStart(2, "0");

export const VIDEOS_ANCHOR = "video-productions";

/* ── Individual Reel Card with desktop hover-to-play preview ──────────────── */
function ReelCard({
    video,
    index,
    onOpen,
}: {
    video: PortfolioVideo;
    index: number;
    onOpen: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        const vid = videoRef.current;
        if (vid) {
            vid.currentTime = 0;
            vid.play().catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        const vid = videoRef.current;
        if (vid) {
            vid.pause();
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.75, delay: (index % 4) * 0.08, ease }}
            className="group flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
            onClick={onOpen}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-hover
        >
            {/* ── 9:16 Reel Container ── */}
            <div className="relative aspect-[9/16] w-full overflow-hidden border border-white/10 bg-[#121212] transition-all duration-500 group-hover:border-white/30 group-hover:shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
                {/* Poster image */}
                <Image
                    src={video.posterSrc}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover transition-all duration-700 ${
                        isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
                    }`}
                />

                {/* Video element for on-hover preview */}
                <video
                    ref={videoRef}
                    src={video.videoSrc}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                />

                {/* Subtle dark ambient gradient at top and bottom */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

                {/* Top header row on card */}
                <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 flex items-center justify-between gap-1.5 z-10">
                    <span
                        className="px-1.5 sm:px-2 py-0.5 text-[7px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-mono font-bold text-brand-navy backdrop-blur-sm"
                        style={{ backgroundColor: video.accent }}
                    >
                        {video.category}
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 bg-black/65 backdrop-blur-md border border-white/15 text-[8px] sm:text-[9px] font-mono tracking-wider text-white/90">
                        {video.duration}
                    </span>
                </div>

                {/* Center play icon overlay (appears on hover or subtle on mobile) */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div
                        className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-navy shadow-lg"
                        style={{
                            boxShadow: `0 0 25px color-mix(in srgb, ${video.accent} 40%, transparent)`,
                        }}
                    >
                        <span className="text-sm sm:text-lg pl-0.5">▶</span>
                    </div>
                </div>

                {/* Bottom details on the card */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-10 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1">
                        {video.logo ? (
                            <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white p-0.5">
                                <Image src={video.logo} alt="" fill className="object-contain" />
                            </div>
                        ) : (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: video.accent }} />
                        )}
                        <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-mono text-white/60 truncate">
                            {video.client}
                        </p>
                    </div>

                    <h4 className="text-sm sm:text-base font-normal uppercase tracking-wide text-white leading-tight line-clamp-2 transition-transform duration-300 group-hover:translate-x-1">
                        {video.title}
                    </h4>

                    {video.tags.length > 0 && (
                        <p className="mt-1 text-[9px] sm:text-[10px] tracking-wider text-white/40 truncate">
                            {video.tags.join(" · ")}
                        </p>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-[9px] sm:text-[10px] font-mono tracking-widest text-white/50 group-hover:text-white transition-colors">
                        <span>Watch Reel</span>
                        <span className="text-xs transition-transform duration-300 group-hover:translate-x-1" style={{ color: video.accent }}>
                            ↗︎
                        </span>
                    </div>
                </div>

                {/* Bottom accent progress line */}
                <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                    style={{ backgroundColor: video.accent }}
                />
            </div>

            {/* Subtext info under card */}
            <div className="mt-3 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/30 px-1">
                <span className="truncate">{video.client}</span>
                <span className="shrink-0">{pad2(index + 1)}</span>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIDEO REELS SHOWCASE — commercial videos, product demos, & social reels
   ══════════════════════════════════════════════════════════════════════════ */
export default function VideoReels({
    eyebrow = "VIDEO PRODUCTIONS & REELS",
    title1 = "COMMERCIAL",
    title2 = "VIDEO REELS",
    description = "High-impact social media reels, commercial ads, and motion graphics produced for visionary Sri Lankan and global brands.",
    reels,
}: {
    eyebrow?: string;
    title1?: string;
    title2?: string;
    description?: string;
    reels?: unknown[];
}) {
    const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("All");
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

    const allVideos = useMemo(() => normalizeVideoReels(reels), [reels]);

    const filteredVideos = useMemo(() => {
        if (selectedCategory === "All") return allVideos;
        return allVideos.filter(v => v.category === selectedCategory);
    }, [selectedCategory, allVideos]);

    const categoryChips = useMemo(() => {
        return VIDEO_CATEGORIES.map(cat => ({
            name: cat,
            count: cat === "All" ? allVideos.length : allVideos.filter(v => v.category === cat).length,
        })).filter(c => c.count > 0);
    }, [allVideos]);

    return (
        <section
            id={VIDEOS_ANCHOR}
            className="mt-20 sm:mt-28 md:mt-36 pt-14 sm:pt-20 border-t border-white/10 overflow-x-clip"
        >
            {/* ── Section Header ── */}
            <div className="flex items-end justify-between flex-wrap gap-6 mb-10 sm:mb-14">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease }}
                >
                    <p className="text-[10px] tracking-[0.5em] uppercase text-white/35 font-mono mb-2 sm:mb-3">
                        {eyebrow}
                    </p>
                    <h3 className="text-[clamp(2.1rem,6vw,5rem)] font-black uppercase tracking-tighter leading-[0.9]">
                        {title1}
                        <br />
                        <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)", color: "transparent" }}>
                            {title2}
                        </span>
                    </h3>
                </motion.div>

                <motion.div
                    className="max-w-sm"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease }}
                >
                    <p className="text-xs sm:text-sm text-white/40 leading-relaxed mb-3">
                        {description}
                    </p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 border border-white/15 bg-white/[0.03] text-[9px] sm:text-[10px] font-mono tracking-widest text-white/70 uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {PORTFOLIO_VIDEOS.length} High-Definition Reels
                    </span>
                </motion.div>
            </div>

            {/* ── Category Filter Chips ── */}
            <div
                className="-mx-5 px-5 sm:-mx-8 sm:px-8 mb-8 sm:mb-12 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain"
                data-lenis-prevent
            >
                <div className="flex gap-2 w-max md:w-auto md:flex-wrap pb-1">
                    {categoryChips.map(chip => {
                        const active = selectedCategory === chip.name;
                        return (
                            <button
                                key={chip.name}
                                type="button"
                                data-hover
                                onClick={() => setSelectedCategory(chip.name)}
                                className="relative px-3.5 py-2 sm:px-4 sm:py-2.5 text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase whitespace-nowrap border transition-all duration-300"
                                style={{
                                    borderColor: active ? "var(--brand-1)" : "rgba(255,255,255,0.12)",
                                    backgroundColor: active ? "var(--brand-1)" : "transparent",
                                    color: active ? "#111111" : "rgba(255,255,255,0.6)",
                                    fontWeight: active ? 700 : 400,
                                }}
                            >
                                {chip.name}
                                <sup className="ml-1.5 font-mono opacity-70">{chip.count}</sup>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Vertical 9:16 Reels Grid ── */}
            <motion.div
                key={selectedCategory}
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8"
            >
                {filteredVideos.map((video, index) => (
                    <ReelCard
                        key={video.id}
                        video={video}
                        index={index}
                        onOpen={() => setActiveVideoIndex(index)}
                    />
                ))}
            </motion.div>

            {/* ── Interactive Reel Lightbox ── */}
            <AnimatePresence>
                {activeVideoIndex !== null && filteredVideos[activeVideoIndex] && (
                    <VideoLightbox
                        key="video-lightbox"
                        videos={filteredVideos}
                        startIndex={activeVideoIndex}
                        onClose={() => setActiveVideoIndex(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
