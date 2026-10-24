"use client";

import { useRef, useEffect, useState } from "react";

export default function Cursor() {
    const dotRef  = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        // Only enable custom cursor if device has a fine pointer (mouse/trackpad), not touch
        const media = window.matchMedia("(pointer: fine) and (hover: hover)");
        if (!media.matches) return;

        setEnabled(true);

        let mx = -200, my = -200;
        let rx = -200, ry = -200;
        let rSize = 38;
        let targetSize = 38;
        let rafId: number;

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
        const onOver = (e: MouseEvent) => {
            const el = (e.target as HTMLElement).closest("a, button, [data-hover]");
            targetSize = el ? 56 : 38;
            if (ringRef.current) ringRef.current.style.opacity = el ? "0.85" : "0.4";
        };

        const tick = () => {
            if (dotRef.current)
                dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;

            rx = lerp(rx, mx, 0.13);
            ry = lerp(ry, my, 0.13);
            rSize = lerp(rSize, targetSize, 0.14);

            if (ringRef.current) {
                const half = rSize / 2;
                ringRef.current.style.transform = `translate(${rx - half}px, ${ry - half}px)`;
                ringRef.current.style.width  = `${rSize}px`;
                ringRef.current.style.height = `${rSize}px`;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        window.addEventListener("mousemove", onMove);
        document.addEventListener("mouseover", onOver);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseover", onOver);
        };
    }, []);

    if (!enabled) return null;

    return (
        <>
            <div
                ref={dotRef}
                className="fixed z-[999] pointer-events-none top-0 left-0 w-3 h-3 rounded-full bg-white mix-blend-difference will-change-transform"
            />
            <div
                ref={ringRef}
                className="fixed z-[998] pointer-events-none top-0 left-0 rounded-full border-2 border-white mix-blend-difference will-change-transform opacity-55"
                style={{ width: 40, height: 40 }}
            />
        </>
    );
}