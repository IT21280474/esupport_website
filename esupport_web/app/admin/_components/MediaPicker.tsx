"use client";

import { useEffect, useState } from "react";
import { btn } from "./ui";

export type MediaEntry = { id: number; url: string; original_name: string | null; width: number | null; height: number | null };

/* Modal grid of uploaded images; resolves with the chosen URL. */
export default function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
    const [items, setItems] = useState<MediaEntry[] | null>(null);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetch("/api/admin/media")
            .then(r => (r.ok ? r.json() : Promise.reject(new Error("Could not load media."))))
            .then(d => setItems(d.items))
            .catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const shown = (items ?? []).filter(i => !query || (i.original_name ?? "").toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-label="Media library">
                <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
                    <h2 className="text-base font-semibold">Choose an image</h2>
                    <input
                        type="search"
                        placeholder="Search by file name…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="ml-auto w-56 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
                    />
                    <button onClick={onClose} className={btn.ghost}>Close</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {!items && !error && <p className="text-sm text-neutral-500">Loading…</p>}
                    {items && !shown.length && <p className="text-sm text-neutral-500">No uploads yet. Use “Upload” on the field, or the Media library page.</p>}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                        {shown.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onPick(item.url)}
                                className="group overflow-hidden rounded-lg border border-neutral-200 text-left hover:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.url} alt="" className="aspect-square w-full bg-neutral-100 object-cover" loading="lazy" />
                                <p className="truncate px-2 py-1.5 text-[11px] text-neutral-600">{item.original_name}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
