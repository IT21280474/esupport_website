"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "./ContentImage";
import type { PortfolioVideo } from "../data/portfolio-videos";

const ease = [0.76, 0, 0.24, 1] as const;
const pad2 = (n: number) => String(n).padStart(2, "0");

export default function VideoLightbox({
    videos,
    startIndex = 0,
    onClose,
}: {
    videos: PortfolioVideo[];
    startIndex?: number;
    onClose: () => void;
}) {
    const count = videos.length;
    const [index, setIndex] = useState(startIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState("0:00");
    const [durationText, setDurationText] = useState("0:00");
    const [showPlayIcon, setShowPlayIcon] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const current = videos[index] ?? videos[0];

    const formatSeconds = (sec: number) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const go = useCallback(
        (step: number) => {
            setIndex(i => (i + step + count) % count);
            setProgress(0);
            setIsPlaying(true);
        },
        [count]
    );

    /* Sync play / pause with video element */
    const togglePlay = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.paused) {
            vid.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            vid.pause();
            setIsPlaying(false);
        }
        setShowPlayIcon(true);
        setTimeout(() => setShowPlayIcon(false), 600);
    }, []);

    const toggleMute = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.muted = !vid.muted;
        setIsMuted(vid.muted);
    }, []);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const bar = progressBarRef.current;
        const vid = videoRef.current;
        if (!bar || !vid || !vid.duration) return;
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        vid.currentTime = ratio * vid.duration;
        setProgress(ratio * 100);
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        const vid = videoRef.current;
        if (!vid) return;
        if (!document.fullscreenElement) {
            vid.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
    };

    /* Keyboard navigation */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowRight") {
                go(1);
            } else if (e.key === "ArrowLeft") {
                go(-1);
            } else if (e.key === " " || e.key === "k") {
                e.preventDefault();
                togglePlay();
            } else if (e.key === "m") {
                toggleMute();
            }
        };
        window.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [go, onClose, togglePlay, toggleMute]);

    /* Reset video when index changes */
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.currentTime = 0;
        vid.muted = isMuted;
        vid.play().then(() => setIsPlaying(true)).catch(() => {
            /* If browser blocked audio autoplay, start muted */
            vid.muted = true;
            setIsMuted(true);
            vid.play().catch(() => setIsPlaying(false));
        });
    }, [index]);

    const onTimeUpdate = () => {
        const vid = videoRef.current;
        if (!vid || !vid.duration) return;
        setProgress((vid.currentTime / vid.duration) * 100);
        setCurrentTime(formatSeconds(vid.currentTime));
        setDurationText(formatSeconds(vid.duration));
    };

    if (!current) return null;

    const accent = current.accent || "var(--brand-1)";

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${current.title} reel`}
            data-lenis-prevent
            className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-black/92 text-white backdrop-blur-xl select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
        >
            {/* ── Top Bar ── */}
            <header
                className="w-full max-w-5xl flex items-center justify-between gap-4 px-4 sm:px-8 py-3 sm:py-5 z-20"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span
                        className="px-2.5 py-1 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-mono font-bold text-brand-navy"
                        style={{ backgroundColor: accent }}
                    >
                        {current.category}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base md:text-lg font-normal uppercase tracking-wide truncate">
                                {current.client}
                            </h4>
                            {current.clientSlug && (
                                <Link
                                    href={`/clients/${current.clientSlug}`}
                                    onClick={onClose}
                                    data-hover
                                    className="hidden sm:inline-flex items-center gap-1 text-[9px] tracking-[0.2em] uppercase font-mono text-white/50 hover:text-white transition-colors border-b border-white/20 pb-0.5"
                                >
                                    View Company ↗︎
                                </Link>
                            )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-white/50 truncate">{current.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 hidden sm:inline">
                        {pad2(index + 1)} / {pad2(count)}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close viewer"
                        data-hover
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-white/25 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase hover:bg-white hover:text-brand-navy transition-colors"
                    >
                        <span>Close</span>
                        <span aria-hidden>✕</span>
                    </button>
                </div>
            </header>

            {/* ── Center Stage: Vertical 9:16 Reel Player ── */}
            <div
                className="relative flex-1 w-full max-w-5xl flex items-center justify-center px-2 sm:px-4 py-1 sm:py-2 z-10"
                onClick={e => e.stopPropagation()}
            >
                {/* Previous reel arrow button (desktop/tablet) */}
                {count > 1 && (
                    <button
                        type="button"
                        aria-label="Previous reel"
                        onClick={() => go(-1)}
                        className="hidden sm:flex absolute left-2 sm:left-4 md:left-8 z-30 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-brand-navy transition-all duration-300"
                    >
                        <span className="text-lg">←</span>
                    </button>
                )}

                {/* Vertical video container with mobile swipe gesture */}
                <motion.div
                    drag={count > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -60) go(1);
                        else if (info.offset.x > 60) go(-1);
                    }}
                    className="relative h-full max-h-[calc(100dvh-155px)] sm:max-h-[80vh] w-auto max-w-[calc(100vw-1.5rem)] aspect-[9/16] overflow-hidden bg-black border border-white/15 shadow-2xl shadow-black/80 flex items-center justify-center cursor-pointer group select-none touch-pan-y"
                    onClick={togglePlay}
                >
                    <video
                        ref={videoRef}
                        src={current.videoSrc}
                        poster={current.posterSrc}
                        playsInline
                        loop
                        onTimeUpdate={onTimeUpdate}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="h-full w-full object-cover pointer-events-none"
                    />

                    {/* Animated play / pause flash indicator in center */}
                    <AnimatePresence>
                        {showPlayIcon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2 }}
                                transition={{ duration: 0.25 }}
                                className="absolute z-20 pointer-events-none flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/30"
                            >
                                <span className="text-lg sm:text-xl">{isPlaying ? "▶" : "❚❚"}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Audio status reminder badge if muted */}
                    {isMuted && (
                        <button
                            type="button"
                            onClick={e => {
                                e.stopPropagation();
                                toggleMute();
                            }}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-black/70 border border-white/20 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider uppercase backdrop-blur-md hover:bg-white hover:text-brand-navy active:scale-95 transition-all shadow-md"
                        >
                            <span>🔇</span>
                            <span>Unmute</span>
                        </button>
                    )}

                    {/* Gradient overlay for bottom controls */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

                    {/* Overlay controls at bottom of video */}
                    <div
                        className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 z-20 flex flex-col gap-1.5 sm:gap-2"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Seekable scrub progress bar */}
                        <div
                            ref={progressBarRef}
                            onClick={handleSeek}
                            className="w-full h-1.5 sm:h-2 bg-white/20 hover:h-2.5 transition-all cursor-pointer relative rounded-full overflow-hidden"
                            title="Click to seek"
                        >
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ width: `${progress}%`, backgroundColor: accent }}
                            />
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center justify-between text-xs font-mono text-white/80">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={togglePlay}
                                    className="p-1 hover:text-white active:scale-90 transition-all text-sm"
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? "❚❚" : "▶"}
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="p-1 hover:text-white active:scale-90 transition-all text-sm"
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? "🔇" : "🔊"}
                                </button>
                                <span className="text-[9px] sm:text-[10px] tracking-widest text-white/60">
                                    {currentTime} / {durationText || current.duration}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-1 hover:text-white active:scale-90 transition-all text-sm"
                                aria-label="Fullscreen"
                                title="Fullscreen"
                            >
                                ⛶
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Next reel arrow button (desktop/tablet) */}
                {count > 1 && (
                    <button
                        type="button"
                        aria-label="Next reel"
                        onClick={() => go(1)}
                        className="hidden sm:flex absolute right-2 sm:right-4 md:right-8 z-30 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-brand-navy transition-all duration-300"
                    >
                        <span className="text-lg">→</span>
                    </button>
                )}
            </div>

            {/* ── Bottom thumbnails strip & description ── */}
            <footer
                className="w-full max-w-5xl px-4 sm:px-8 py-3 sm:py-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white/60"
                onClick={e => e.stopPropagation()}
            >
                <p className="text-[11px] sm:text-xs max-w-md line-clamp-2 text-white/70">
                    {current.description}
                </p>

                {/* Quick thumbnails reel nav */}
                <div
                    className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-xs py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    data-lenis-prevent
                >
                    {videos.map((v, i) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                                setIndex(i);
                                setProgress(0);
                                setIsPlaying(true);
                            }}
                            aria-label={`Switch to ${v.title}`}
                            className={`relative h-12 w-8 shrink-0 overflow-hidden border transition-all duration-300 ${
                                i === index
                                    ? "border-white scale-105 shadow-md shadow-white/20"
                                    : "border-white/20 opacity-50 hover:opacity-90"
                            }`}
                        >
                            <Image src={v.posterSrc} alt={v.title} fill sizes="32px" className="object-cover" />
                        </button>
                    ))}
                </div>
            </footer>
        </motion.div>
    );
}
