"use client";

import { useId, useRef, useState } from "react";
import type { Field } from "@/lib/content/schema";
import type { LayoutSectionKey } from "@/lib/content/types";
import MediaPicker from "./MediaPicker";
import { captureSite, uploadFiles } from "./upload";
import { btn, helpCls, inputCls, labelCls } from "./ui";

type Obj = Record<string, unknown>;

type FieldProps = {
    field: Field;
    value: unknown;
    onChange: (value: unknown) => void;
    /** The object this field lives in (for sibling lookups like captureFrom). */
    siblings: Obj;
    /** Section root (for multiSelect option lists). */
    root: Obj;
};

/* ── Object = a group of fields ───────────────────────────────────────────── */
export function ObjectFields({ fields, value, onChange, root }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; root: Obj }) {
    return (
        <div className="space-y-5">
            {fields.map(field => (
                <FieldEditor
                    key={field.key}
                    field={field}
                    value={value[field.key]}
                    siblings={value}
                    root={root}
                    onChange={v => onChange({ ...value, [field.key]: v })}
                />
            ))}
        </div>
    );
}

/* ── Single field dispatcher ──────────────────────────────────────────────── */
export function FieldEditor(props: FieldProps) {
    const { field, value, onChange } = props;
    const id = useId();
    const str = typeof value === "string" ? value : value == null ? "" : String(value);

    const wrap = (control: React.ReactNode, labelFor = true) => (
        <div>
            {labelFor ? <label htmlFor={id} className={labelCls}>{field.label}</label> : <p className={labelCls}>{field.label}</p>}
            {control}
            {field.help && <p className={helpCls}>{field.help}</p>}
        </div>
    );

    switch (field.kind) {
        case "text":
            return wrap(<input id={id} type="text" value={str} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} className={inputCls} />);
        case "url":
            return wrap(<input id={id} type="text" inputMode="url" value={str} placeholder={field.placeholder ?? "https://"} onChange={e => onChange(e.target.value)} className={`${inputCls} font-mono text-[13px]`} />);
        case "textarea":
            return wrap(<textarea id={id} rows={field.rows ?? 3} value={str} onChange={e => onChange(e.target.value)} className={`${inputCls} resize-y leading-relaxed`} />);
        case "number":
            return wrap(
                <input
                    id={id}
                    type="number"
                    value={typeof value === "number" ? value : str}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className={`${inputCls} max-w-[12rem]`}
                />
            );
        case "color":
            return wrap(<ColorInput id={id} value={str} onChange={onChange} />);
        case "boolean":
            if (field.key === "isActive") {
                const isPublished = value !== false;
                return (
                    <div>
                        <p className={labelCls}>Live Site Status</p>
                        <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                            <button
                                type="button"
                                onClick={() => onChange(true)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    isPublished
                                        ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30"
                                        : "bg-white text-neutral-600 border border-neutral-300 hover:border-emerald-500 hover:text-emerald-700"
                                }`}
                            >
                                <span className="text-sm leading-none">●</span> Publish
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange(false)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    !isPublished
                                        ? "bg-neutral-800 text-white shadow-sm ring-2 ring-neutral-900/30"
                                        : "bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-700 hover:text-neutral-900"
                                }`}
                            >
                                <span className="text-sm leading-none">○</span> Unpublish
                            </button>
                            <span className={`text-xs font-medium ml-1 ${isPublished ? "text-emerald-700" : "text-amber-700"}`}>
                                {isPublished ? "✓ Currently Live on /careers" : "⊘ Hidden from live site"}
                            </span>
                        </div>
                        {field.help && <p className={helpCls}>{field.help}</p>}
                    </div>
                );
            }
            return (
                <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} className="h-4 w-4 accent-neutral-900" />
                    {field.label}
                </label>
            );
        case "select":
            return wrap(
                <select id={id} value={str} onChange={e => onChange(e.target.value)} className={`${inputCls} max-w-xs`}>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            );
        case "image":
            return wrap(<ImageInput id={id} value={str} onChange={onChange} captureUrl={field.captureFrom ? String(props.siblings[field.captureFrom] ?? "") : undefined} />);
        case "stringList":
            return wrap(
                field.key === "brandColors"
                    ? <ColorList value={Array.isArray(value) ? value.map(String) : []} onChange={onChange} />
                    : <StringList value={Array.isArray(value) ? value.map(String) : []} onChange={onChange} placeholder={field.placeholder} fixed={field.fixedLength} />,
                false
            );
        case "multiSelect": {
            const options = Array.isArray(props.root[field.optionsFrom]) ? (props.root[field.optionsFrom] as unknown[]).map(String) : [];
            const selected = Array.isArray(value) ? value.map(String) : [];
            return wrap(
                <div className="flex flex-wrap gap-1.5">
                    {options.map(opt => {
                        const on = selected.includes(opt);
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => onChange(on ? selected.filter(s => s !== opt) : [...selected, opt])}
                                className={`rounded-full border px-3 py-1 text-xs transition-colors ${on ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500"}`}
                            >
                                {on ? "✓ " : ""}{opt}
                            </button>
                        );
                    })}
                    {!options.length && <p className="text-xs text-neutral-500">Add categories above first.</p>}
                </div>,
                false
            );
        }
        case "list":
            return <ListField {...props} field={field} />;
        case "sections":
            return wrap(<SectionsOrder labels={field.labels ?? {}} value={Array.isArray(value) ? (value as { key: LayoutSectionKey; visible: boolean }[]) : []} onChange={onChange} />, false);
    }
}

/* ── Colour ───────────────────────────────────────────────────────────────── */
function ColorInput({ id, value, onChange }: { id?: string; value: string; onChange: (v: string) => void }) {
    const valid = /^#[0-9a-f]{6}$/i.test(value);
    return (
        <div className="flex items-center gap-2">
            <input type="color" value={valid ? value : "#000000"} onChange={e => onChange(e.target.value)} className="h-9 w-11 rounded-md border border-neutral-300 bg-white p-1" aria-label="Pick colour" />
            <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} className={`${inputCls} max-w-[8rem] font-mono uppercase`} />
        </div>
    );
}

function ColorList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    return (
        <div className="space-y-3">
            <div className="flex h-3 overflow-hidden rounded-full">
                {value.map((c, i) => <span key={i} className="flex-1" style={{ backgroundColor: c }} />)}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {value.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-14 text-xs text-neutral-500">Colour {i + 1}</span>
                        <ColorInput value={c} onChange={v => onChange(value.map((x, j) => (j === i ? v : x)))} />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Simple list of strings ───────────────────────────────────────────────── */
function StringList({ value, onChange, placeholder, fixed }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; fixed?: number }) {
    const move = (i: number, d: number) => {
        const next = [...value];
        const [item] = next.splice(i, 1);
        next.splice(i + d, 0, item);
        onChange(next);
    };
    return (
        <div className="space-y-2">
            {value.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <input type="text" value={item} placeholder={placeholder} onChange={e => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} />
                    {!fixed && (
                        <>
                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btn.small} aria-label="Move up">↑</button>
                            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className={btn.small} aria-label="Move down">↓</button>
                            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className={`${btn.small} hover:text-red-600`} aria-label="Remove">✕</button>
                        </>
                    )}
                </div>
            ))}
            {!fixed && (
                <button type="button" onClick={() => onChange([...value, ""])} className={`${btn.secondary} py-1.5 text-xs`}>+ Add item</button>
            )}
        </div>
    );
}

/* ── Image: URL + upload + library + optional live-site capture ───────────── */
function ImageInput({ id, value, onChange, captureUrl }: { id: string; value: string; onChange: (v: string) => void; captureUrl?: string }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<"" | "upload" | "capture">("");
    const [error, setError] = useState("");
    const [picking, setPicking] = useState(false);
    const [broken, setBroken] = useState(false);

    const run = async (kind: "upload" | "capture", fn: () => Promise<string>) => {
        setBusy(kind);
        setError("");
        try {
            onChange(await fn());
            setBroken(false);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy("");
        }
    };

    return (
        <div className="flex gap-4">
            <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-[repeating-conic-gradient(#f4f4f5_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
                {value && !broken ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={value} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] text-neutral-400">
                        {value ? "Image not found" : "No image"}
                    </span>
                )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                <input id={id} type="text" value={value} placeholder="/uploads/… or https://…" onChange={e => { setBroken(false); onChange(e.target.value); }} className={`${inputCls} font-mono text-[12px]`} />
                <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={!!busy} className={`${btn.secondary} py-1.5 text-xs`}>
                        {busy === "upload" ? "Uploading…" : "Upload"}
                    </button>
                    <button type="button" onClick={() => setPicking(true)} disabled={!!busy} className={`${btn.secondary} py-1.5 text-xs`}>Library</button>
                    {captureUrl !== undefined && (
                        <button
                            type="button"
                            onClick={() => run("capture", () => captureSite(captureUrl))}
                            disabled={!!busy || !/^https?:\/\/.+\..+/.test(captureUrl)}
                            className={`${btn.secondary} py-1.5 text-xs`}
                            title="Take a screenshot of the website URL above"
                        >
                            {busy === "capture" ? "Capturing… (up to 1 min)" : "Capture from URL"}
                        </button>
                    )}
                    {value && <button type="button" onClick={() => onChange("")} className={`${btn.small} hover:text-red-600`}>Remove</button>}
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={e => {
                        const files = e.target.files;
                        if (files?.length) run("upload", async () => (await uploadFiles([files[0]]))[0].url);
                        e.target.value = "";
                    }}
                />
            </div>
            {picking && <MediaPicker onClose={() => setPicking(false)} onPick={url => { onChange(url); setBroken(false); setPicking(false); }} />}
        </div>
    );
}

/* ── Repeatable list of objects ───────────────────────────────────────────── */
function ListField({ field, value, onChange, root }: FieldProps & { field: Extract<Field, { kind: "list" }> }) {
    const items = Array.isArray(value) ? (value as Obj[]) : [];
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const searchable = items.length > 8;

    const update = (next: Obj[]) => onChange(next);
    const move = (i: number, d: number) => {
        const next = [...items];
        const [item] = next.splice(i, 1);
        next.splice(i + d, 0, item);
        update(next);
        if (openIdx === i) setOpenIdx(i + d);
    };
    const titleOf = (item: Obj, i: number) => String(item[field.itemTitle] ?? "").trim() || `Item ${i + 1}`;
    const visible = items
        .map((item, i) => ({ item, i }))
        .filter(({ item, i }) => !query || titleOf(item, i).toLowerCase().includes(query.toLowerCase()));

    return (
        <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                    <p className={labelCls + " mb-0"}>{field.label} <span className="font-normal text-neutral-400">({items.length})</span></p>
                    {field.help && <p className={helpCls}>{field.help}</p>}
                </div>
                {searchable && (
                    <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${field.label.toLowerCase()}…`} className="w-56 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" />
                )}
            </div>
            <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {visible.map(({ item, i }) => {
                    const open = openIdx === i;
                    const hasActiveToggle = "isActive" in item || field.fields.some(f => f.key === "isActive");
                    const isPublished = item.isActive !== false;
                    return (
                        <div key={i} className={open ? "bg-neutral-50/60" : ""}>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-3 py-2">
                                <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                                    <span className={`text-xs text-neutral-400 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
                                    <span className="w-6 shrink-0 font-mono text-[11px] text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
                                    <span className={`truncate text-sm font-medium ${!isPublished ? "text-neutral-400 line-through" : ""}`}>{titleOf(item, i)}</span>
                                    {hasActiveToggle && (
                                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                            isPublished
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-neutral-100 text-neutral-400 border-neutral-200"
                                        }`}>
                                            {isPublished ? "Live" : "Hidden"}
                                        </span>
                                    )}
                                </button>

                                {hasActiveToggle && (
                                    <div className="flex items-center gap-1.5 shrink-0 mr-1">
                                        <button
                                            type="button"
                                            title="Publish (show on live site)"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                update(items.map((x, j) => (j === i ? { ...x, isActive: true } : x)));
                                            }}
                                            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                                                isPublished
                                                    ? "bg-emerald-600 text-white shadow-xs"
                                                    : "bg-white text-neutral-500 border border-neutral-300 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                                            }`}
                                        >
                                            Publish
                                        </button>
                                        <button
                                            type="button"
                                            title="Unpublish (hide from live site)"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                update(items.map((x, j) => (j === i ? { ...x, isActive: false } : x)));
                                            }}
                                            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                                                !isPublished
                                                    ? "bg-neutral-800 text-white shadow-xs"
                                                    : "bg-white text-neutral-500 border border-neutral-300 hover:border-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                                            }`}
                                        >
                                            Unpublish
                                        </button>
                                    </div>
                                )}
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btn.small} aria-label="Move up">↑</button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={btn.small} aria-label="Move down">↓</button>
                                <button type="button" onClick={() => { const next = [...items]; next.splice(i + 1, 0, structuredClone(item)); update(next); }} className={btn.small} title="Duplicate">⧉</button>
                                <button
                                    type="button"
                                    onClick={() => { if (confirm(`Remove “${titleOf(item, i)}”?`)) { update(items.filter((_, j) => j !== i)); setOpenIdx(null); } }}
                                    className={`${btn.small} hover:text-red-600`}
                                    aria-label="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                            {open && (
                                <div className="border-t border-neutral-200 px-4 py-5 sm:px-10">
                                    <ObjectFields fields={field.fields} value={item} root={root} onChange={v => update(items.map((x, j) => (j === i ? v : x)))} />
                                </div>
                            )}
                        </div>
                    );
                })}
                {!visible.length && <p className="px-4 py-6 text-center text-sm text-neutral-500">{items.length ? "No matches." : "Nothing here yet."}</p>}
            </div>
            <button
                type="button"
                onClick={() => { update([...items, structuredClone(field.newItem)]); setOpenIdx(items.length); setQuery(""); }}
                className={`${btn.secondary} mt-2 py-1.5 text-xs`}
            >
                + Add {field.label.toLowerCase().replace(/s$/, "")}
            </button>
        </div>
    );
}

/* ── Home page section order & visibility ─────────────────────────────────── */
function SectionsOrder({ labels, value, onChange }: { labels: Record<string, string>; value: { key: LayoutSectionKey; visible: boolean }[]; onChange: (v: unknown) => void }) {
    const move = (i: number, d: number) => {
        const next = [...value];
        const [item] = next.splice(i, 1);
        next.splice(i + d, 0, item);
        onChange(next);
    };
    return (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <p className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">Hero (always first)</p>
            <ul className="divide-y divide-neutral-200">
                {value.map((s, i) => (
                    <li key={s.key} className={`flex items-center gap-3 px-4 py-2.5 ${s.visible ? "" : "bg-neutral-50 text-neutral-400"}`}>
                        <span className="w-6 font-mono text-[11px] text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
                        <span className={`flex-1 text-sm ${s.visible ? "" : "line-through"}`}>{labels[s.key] ?? s.key}</span>
                        <label className="flex items-center gap-2 text-xs">
                            <input type="checkbox" checked={s.visible} onChange={e => onChange(value.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)))} className="h-4 w-4 accent-neutral-900" />
                            Visible
                        </label>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btn.small} aria-label="Move up">↑</button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className={btn.small} aria-label="Move down">↓</button>
                    </li>
                ))}
            </ul>
            <p className="border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">Footer (always last)</p>
        </div>
    );
}
