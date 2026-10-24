"use client";

import { useEffect, useRef } from "react";

/* An animated "network" behind the hero: nodes drift and link up, data packets travel along the links and
   ring pulses fire where they arrive. Colours are the eSupport logo's. It is drawn on a canvas, so it stays
   sharp at any size and weighs a few KB, unlike a video file. */

const NODE_COLORS = ["#E86A2A", "#F6AF1C", "#43AEB6", "#316B7B", "#CB1A34"];
const PACKET_COLORS = ["#E86A2A", "#F6AF1C", "#43AEB6"];
const LINE_RGB = "49, 107, 123";
/* What eSupport does; a few nodes carry one of these as a small label. */
const LABELS = ["WEB", "SEO", "ERP", "API", "UI/UX", "CLOUD", "ADS", "APP", "DATA"];

type Node = { x: number; y: number; vx: number; vy: number; r: number; color: string; label?: string };
type Packet = { from: number; to: number; t: number; speed: number; color: string };
type Pulse = { x: number; y: number; r: number; max: number; color: string };

export default function TechBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let width = 0;
        let height = 0;
        let link = 150;
        let nodes: Node[] = [];
        const packets: Packet[] = [];
        const pulses: Pulse[] = [];
        let raf = 0;
        let last = 0;
        let sinceSpawn = 0;
        let onScreen = true;

        const neighbours = (i: number) => {
            const out: number[] = [];
            for (let j = 0; j < nodes.length; j++) {
                if (j === i) continue;
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                if (dx * dx + dy * dy < link * link) out.push(j);
            }
            return out;
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            link = Math.min(190, Math.max(110, width / 9));
            const count = Math.round(Math.min(90, Math.max(30, (width * height) / 19000)));
            nodes = Array.from({ length: count }, (_, i) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.24,
                vy: (Math.random() - 0.5) * 0.24,
                r: 1.7 + Math.random() * 2.1,
                color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
                label: i % 7 === 0 ? LABELS[(i / 7) % LABELS.length] : undefined,
            }));
            packets.length = 0;
            pulses.length = 0;
            draw();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > link * link) continue;
                    ctx.strokeStyle = `rgba(${LINE_RGB}, ${(1 - Math.sqrt(d2) / link) * 0.34})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }

            for (const p of pulses) {
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = (1 - p.r / p.max) * 0.55;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            for (const n of nodes) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + 1.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = n.color;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
            ctx.fillStyle = `rgba(${LINE_RGB}, 0.75)`;
            for (const n of nodes) if (n.label) ctx.fillText(n.label, n.x + n.r + 7, n.y - n.r - 3);

            for (const p of packets) {
                const a = nodes[p.from];
                const b = nodes[p.to];
                const x = a.x + (b.x - a.x) * p.t;
                const y = a.y + (b.y - a.y) * p.t;
                const t0 = Math.max(0, p.t - 0.14);
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = 0.55;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 14;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        };

        const step = (now: number) => {
            raf = requestAnimationFrame(step);
            if (!onScreen) return;
            const dt = Math.min((now - last) / 1000 || 0, 0.05);
            last = now;

            for (const n of nodes) {
                n.x += n.vx * dt * 60;
                n.y += n.vy * dt * 60;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;
            }

            sinceSpawn += dt;
            if (sinceSpawn > 0.32 && packets.length < 14) {
                sinceSpawn = 0;
                const from = Math.floor(Math.random() * nodes.length);
                const options = neighbours(from);
                if (options.length) {
                    packets.push({
                        from,
                        to: options[Math.floor(Math.random() * options.length)],
                        t: 0,
                        speed: 0.45 + Math.random() * 0.5,
                        color: PACKET_COLORS[Math.floor(Math.random() * PACKET_COLORS.length)],
                    });
                }
            }

            for (let i = packets.length - 1; i >= 0; i--) {
                const p = packets[i];
                p.t += p.speed * dt;
                if (p.t >= 1) {
                    const to = nodes[p.to];
                    pulses.push({ x: to.x, y: to.y, r: 4, max: 46, color: p.color });
                    packets.splice(i, 1);
                }
            }
            for (let i = pulses.length - 1; i >= 0; i--) {
                pulses[i].r += 38 * dt;
                if (pulses[i].r >= pulses[i].max) pulses.splice(i, 1);
            }

            draw();
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);

        /* A still frame for visitors who ask their device for less motion. */
        if (reduceMotion) return () => observer.disconnect();

        const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
        visibility.observe(canvas);
        raf = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            visibility.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
