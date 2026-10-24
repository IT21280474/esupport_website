"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMediaAction } from "../../actions";
import { uploadFiles } from "../../_components/upload";
import { btn, cardCls, formatDate } from "../../_components/ui";

export type MediaItem = {
    id: number;
    url: string;
    original_name: string | null;
    size: number;
    width: number | null;
    height: number | null;
    uploader: string | null;
    created_at: string;
};

const kb = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState(initial);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [drag, setDrag] = useState(false);
    const [copied, setCopied] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const [pending, start] = useTransition();

    const upload = async (files: FileList | File[]) => {
        if (!files.length) return;
        setBusy(true);
        setError("");
        try {
            await uploadFiles(files);
            router.refresh();
            const res = await fetch("/api/admin/media");
            setItems((await res.json()).items);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const remove = (item: MediaItem) => {
        if (!confirm(`Delete ${item.original_name}? Pages still using this image will show a placeholder.`)) return;
        start(async () => {
            const res = await deleteMediaAction(item.id);
            if (res.error) return setError(res.error);
            setItems(list => list.filter(i => i.id !== item.id));
        });
    };

    const copy = async (item: MediaItem) => {
        await navigator.clipboard.writeText(item.url);
        setCopied(item.id);
        setTimeout(() => setCopied(null), 1500);
    };

    const shown = items.filter(i => !query || (i.original_name ?? "").toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="space-y-6">
            <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
                className={`${cardCls} flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors ${drag ? "border-neutral-900 bg-neutral-50" : "border-neutral-300"}`}
            >
                <p className="text-sm font-medium">{busy ? "Uploading…" : "Drag images here"}</p>
                <p className="text-xs text-neutral-500">JPG, PNG, WebP, GIF or AVIF · up to 15 MB each</p>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={btn.primary}>Choose files</button>
                <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden"
                    onChange={e => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-neutral-500">{items.length} file{items.length === 1 ? "" : "s"}</p>
                <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="w-56 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {shown.map(item => (
                    <figure key={item.id} className={`${cardCls} group overflow-hidden`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.original_name ?? ""} loading="lazy" className="aspect-[4/3] w-full bg-neutral-100 object-cover" />
                        <figcaption className="space-y-1 p-3">
                            <p className="truncate text-sm font-medium" title={item.original_name ?? ""}>{item.original_name}</p>
                            <p className="text-[11px] text-neutral-500">
                                {item.width}×{item.height} · {kb(item.size)} · {item.uploader ?? "—"}
                            </p>
                            <p className="text-[11px] text-neutral-400">{formatDate(item.created_at)}</p>
                            <div className="flex gap-1 pt-1">
                                <button type="button" onClick={() => copy(item)} className={btn.small}>{copied === item.id ? "Copied ✓" : "Copy link"}</button>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className={btn.small}>Open</a>
                                <button type="button" onClick={() => remove(item)} disabled={pending} className={`${btn.small} ml-auto hover:text-red-600`}>Delete</button>
                            </div>
                        </figcaption>
                    </figure>
                ))}
            </div>
            {!items.length && <p className="text-center text-sm text-neutral-500">No uploads yet.</p>}
        </div>
    );
}
