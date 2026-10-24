"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SectionDef } from "@/lib/content/schema";
import { discardDraftAction, resetSectionAction, restoreRevisionAction, saveSectionAction } from "../actions";
import { ObjectFields } from "./FieldEditor";
import { btn, cardCls, formatDate } from "./ui";

type Revision = { id: number; created_at: string; user_name: string | null };

/** The signed-in editor's own unpublished version: waiting for an admin, or turned down. */
export type Draft = {
    id: number;
    status: "pending" | "rejected";
    submitted_at: string;
    reviewed_at: string | null;
    reviewer_name: string | null;
    review_note: string | null;
    data: Record<string, unknown>;
};

export default function SectionEditor({
    definition: def,
    initial,
    revisions,
    meta,
    canReset,
    canPublish,
    draft,
    pendingCount,
    previewHref,
}: {
    definition: SectionDef;
    initial: Record<string, unknown>;
    revisions: Revision[];
    meta?: { updated_at: string; updated_by: string | null };
    canReset: boolean;
    /** Admins publish directly; editors submit for approval. */
    canPublish: boolean;
    draft: Draft | null;
    /** Admins only: editors' changes to this section waiting for review. */
    pendingCount: number;
    previewHref: string;
}) {
    const sectionKey = def.key;
    const router = useRouter();
    /* Editors continue from their own unpublished version rather than the live content. */
    const start = draft?.data ?? initial;
    const [data, setData] = useState(start);
    const [saved, setSaved] = useState(() => JSON.stringify(start));
    const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [pending, startTransition] = useTransition();

    const dirty = useMemo(() => JSON.stringify(data) !== saved, [data, saved]);

    const flash = (kind: "ok" | "error", text: string) => {
        setToast({ kind, text });
        setTimeout(() => setToast(null), 3500);
    };

    const save = useCallback(() => {
        startTransition(async () => {
            const res = await saveSectionAction(sectionKey, data);
            if (res.error || !res.data) return flash("error", res.error ?? "Save failed.");
            const clean = res.data as Record<string, unknown>;
            setData(clean);
            setSaved(JSON.stringify(clean));
            flash("ok", res.published ? "Saved — the live site is updated." : "Sent for approval — it goes live once an admin approves it.");
            router.refresh();
        });
    }, [data, sectionKey, router]);

    /* Ctrl/Cmd+S saves; leaving with unsaved edits asks first. */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                if (dirty && !pending) save();
            }
        };
        const onUnload = (e: BeforeUnloadEvent) => {
            if (dirty) e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("beforeunload", onUnload);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("beforeunload", onUnload);
        };
    }, [dirty, pending, save]);

    const restore = (rev: Revision) => {
        const outcome = canPublish ? "It goes live immediately." : "It will be sent to an admin for approval.";
        if (!confirm(`Restore the version saved ${formatDate(rev.created_at)}${rev.user_name ? ` by ${rev.user_name}` : ""}? ${outcome}`)) return;
        startTransition(async () => {
            const res = await restoreRevisionAction(sectionKey, rev.id);
            if (res.error || !res.data) return flash("error", res.error ?? "Restore failed.");
            const clean = res.data as Record<string, unknown>;
            setData(clean);
            setSaved(JSON.stringify(clean));
            setShowHistory(false);
            flash("ok", res.published ? "Version restored and published." : "Restored version sent for approval.");
            router.refresh();
        });
    };

    const discardDraft = () => {
        const what = draft?.status === "rejected" ? "your rejected changes" : "your change request";
        if (!confirm(`Discard ${what} and go back to the live content?`)) return;
        startTransition(async () => {
            const res = await discardDraftAction(sectionKey);
            if (res.error) return flash("error", res.error);
            /* Reload so the editor starts again from the live content. */
            window.location.reload();
        });
    };

    const reset = () => {
        if (!confirm(`Reset “${def.title}” to the original built-in content? Your edits stay in History.`)) return;
        startTransition(async () => {
            const res = await resetSectionAction(sectionKey);
            if (res.error) return flash("error", res.error);
            flash("ok", "Reset to defaults.");
            router.refresh();
            /* The page re-renders with fresh defaults; reload state from the server. */
            window.location.reload();
        });
    };

    return (
        <div>
            {/* Sticky header */}
            <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-neutral-200 bg-neutral-50/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{def.group}</p>
                        <h1 className="truncate text-xl font-bold tracking-tight">{def.title}</h1>
                    </div>
                    <span className={`text-xs ${dirty ? "text-amber-600" : "text-neutral-400"}`}>
                        {dirty
                            ? "● Unsaved changes"
                            : draft?.status === "pending"
                              ? "Waiting for approval"
                              : meta
                                ? `Live since ${formatDate(meta.updated_at)}${meta.updated_by ? ` · ${meta.updated_by}` : ""}`
                                : "Using default content"}
                    </span>
                    <a href={previewHref} target="_blank" rel="noopener noreferrer" className={btn.ghost}>View ↗&#xFE0E;</a>
                    <button type="button" onClick={() => setShowHistory(s => !s)} className={btn.secondary}>History ({revisions.length})</button>
                    {dirty && <button type="button" onClick={() => setData(JSON.parse(saved))} disabled={pending} className={btn.ghost}>Discard</button>}
                    <button type="button" onClick={save} disabled={!dirty || pending} className={btn.primary}>
                        {pending ? "Saving…" : canPublish ? "Save & publish" : "Submit for approval"}
                    </button>
                </div>
            </div>

            {draft?.status === "pending" && (
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="min-w-0 flex-1">
                        <span className="font-semibold">Waiting for admin approval</span> — sent {formatDate(draft.submitted_at)}. The live site still shows the
                        previous version. Saving again updates your request.
                    </p>
                    <button type="button" onClick={discardDraft} disabled={pending} className={`${btn.small} hover:text-red-600`}>Withdraw request</button>
                </div>
            )}
            {draft?.status === "rejected" && (
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                    <div className="min-w-0 flex-1">
                        <p>
                            <span className="font-semibold">Not approved</span>
                            {draft.reviewer_name ? ` by ${draft.reviewer_name}` : ""} · {formatDate(draft.reviewed_at)}. Edit below and submit again.
                        </p>
                        {draft.review_note && <p className="mt-1 whitespace-pre-line text-red-800">“{draft.review_note}”</p>}
                    </div>
                    <button type="button" onClick={discardDraft} disabled={pending} className={`${btn.small} hover:text-red-600`}>Discard my changes</button>
                </div>
            )}
            {canPublish && pendingCount > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    <p className="min-w-0 flex-1">
                        {pendingCount === 1 ? "An editor's change" : `${pendingCount} editors' changes`} to this section {pendingCount === 1 ? "is" : "are"} waiting for
                        your approval.
                    </p>
                    <Link href="/admin/approvals" className={btn.small}>Review →</Link>
                </div>
            )}

            <p className="mb-6 max-w-2xl text-sm text-neutral-500">{def.description}</p>

            {showHistory && (
                <div className={`${cardCls} mb-6 overflow-hidden`}>
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                        <h2 className="text-sm font-semibold">Version history</h2>
                        {canReset && meta && <button type="button" onClick={reset} disabled={pending} className={`${btn.danger} py-1.5 text-xs`}>Reset to defaults</button>}
                    </div>
                    {revisions.length ? (
                        <ul className="max-h-72 divide-y divide-neutral-100 overflow-y-auto">
                            {revisions.map((rev, i) => (
                                <li key={rev.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                                    <span>
                                        {formatDate(rev.created_at)}
                                        <span className="text-neutral-400"> · {rev.user_name ?? "deleted user"}</span>
                                        {i === 0 && <span className="ml-2 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-700">Live</span>}
                                    </span>
                                    {i > 0 && <button type="button" onClick={() => restore(rev)} disabled={pending} className={btn.small}>Restore</button>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-4 py-6 text-sm text-neutral-500">No saved versions yet — this section shows the built-in default content.</p>
                    )}
                </div>
            )}

            <div className={`${cardCls} p-5 sm:p-8`}>
                <ObjectFields fields={def.fields} value={data} root={data} onChange={setData} />
            </div>

            {toast && (
                <div
                    role="status"
                    className={`fixed bottom-6 right-6 z-[400] rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.kind === "ok" ? "bg-neutral-900 text-white" : "bg-red-600 text-white"}`}
                >
                    {toast.text}
                </div>
            )}
        </div>
    );
}
