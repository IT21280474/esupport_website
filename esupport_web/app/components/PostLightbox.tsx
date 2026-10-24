"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "./ContentImage";

const ease = [0.76, 0, 0.24, 1] as const;
const SWIPE_DISTANCE = 70;

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ── Full-screen viewer for one company's posts ───────────────────────────── */
export default function PostLightbox({
    name,
    posts,
    startIndex = 0,
    accent,
    onClose,
}: {
    name: string;
    posts: { image: string }[];
    startIndex?: number;
    accent: string;
    onClose: () => void;
}) {
    const count = posts.length;
    const [index, setIndex] = useState(startIndex);
    const [direction, setDirection] = useState(1);
    const closeRef = useRef<HTMLButtonElement>(null);
    const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const go = useCallback(
        (step: number) => {
            setDirection(step);
            setIndex(i => (i + step + count) % count);
        },
        [count]
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight") go(1);
            else if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [go, onClose]);

    useEffect(() => {
        thumbRefs.current[index]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }, [index]);

    const post = posts[index];
    const arrow =
        "absolute top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center border border-white/25 bg-black/50 text-base md:text-lg backdrop-blur-sm hover:bg-white hover:text-brand-navy transition-colors";

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} post designs`}
            data-lenis-prevent
            className="fixed inset-0 z-[200] flex flex-col bg-black/90 text-white backdrop-blur-md overscroll-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-6" onClick={e => e.stopPropagation()}>
                <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.4em] uppercase font-mono" style={{ color: accent }}>
                        {pad2(index + 1)} / {pad2(count)}
                    </p>
                    <h4 className="mt-1 truncate text-base sm:text-lg md:text-2xl font-normal uppercase tracking-wide">{name}</h4>
                </div>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    className="shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2.5 border border-white/25 text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] uppercase hover:bg-white hover:text-brand-navy transition-colors"
                >
                    Close ✕
                </button>
            </div>

            {/* Stage */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-4 md:px-24 touch-pan-y">
                {count > 1 && (
                    <button type="button" aria-label="Previous post" onClick={e => { e.stopPropagation(); go(-1); }} className={`${arrow} hidden sm:flex left-2 sm:left-3 md:left-8`}>
                        ←
                    </button>
                )}
                <div className="relative h-full max-h-[calc(100dvh-150px)] max-w-[calc(100vw-1.5rem)] aspect-[4/5]" onClick={e => e.stopPropagation()}>
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.div
                            key={index}
                            custom={direction}
                            variants={{
                                enter: (d: number) => ({ opacity: 0, x: 60 * d }),
                                center: { opacity: 1, x: 0 },
                                exit: (d: number) => ({ opacity: 0, x: -60 * d }),
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease }}
                            drag={count > 1 ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.25}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -SWIPE_DISTANCE) go(1);
                                else if (info.offset.x > SWIPE_DISTANCE) go(-1);
                            }}
                            className="absolute inset-0 select-none"
                        >
                            <Image
                                src={post.image}
                                alt={`${name} post ${index + 1} of ${count}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 720px"
                                className="object-contain select-none pointer-events-none"
                                draggable={false}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
                {count > 1 && (
                    <button type="button" aria-label="Next post" onClick={e => { e.stopPropagation(); go(1); }} className={`${arrow} hidden sm:flex right-2 sm:right-3 md:right-8`}>
                        →
                    </button>
                )}
            </div>

            {/* Thumbnails */}
            {count > 1 && (
                <div className="overflow-x-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onClick={e => e.stopPropagation()}>
                    <div className="mx-auto flex w-max gap-2">
                        {posts.map((p, i) => (
                            <button
                                key={p.image}
                                ref={el => { thumbRefs.current[i] = el; }}
                                type="button"
                                aria-label={`Show post ${i + 1}`}
                                aria-current={i === index}
                                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                                className={`relative aspect-[4/5] w-10 sm:w-11 md:w-14 shrink-0 overflow-hidden border transition-all duration-300 ${i === index ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
                                style={{ borderColor: i === index ? accent : "rgba(255,255,255,0.15)" }}
                            >
                                <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
