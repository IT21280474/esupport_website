"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveRevisionAction, rejectRevisionAction } from "../../../actions";
import { btn, inputCls, labelCls } from "../../../_components/ui";

export default function ReviewActions({ id, stale }: { id: number; stale: boolean }) {
    const router = useRouter();
    const [note, setNote] = useState("");
    const [rejecting, setRejecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    const approve = () => {
        const warning = stale ? "\n\nThe live section changed after this was submitted — approving replaces those newer changes." : "";
        if (!confirm(`Approve and publish this change to the live site?${warning}`)) return;
        start(async () => {
            const res = await approveRevisionAction(id);
            if (res.error) return setError(res.error);
            router.push("/admin/approvals?done=approved");
        });
    };

    const reject = () => {
        start(async () => {
            const res = await rejectRevisionAction(id, note);
            if (res.error) return setError(res.error);
            router.push("/admin/approvals?done=rejected");
        });
    };

    return (
        <div className="space-y-3">
            {rejecting ? (
                <div className="space-y-3">
                    <label className="block">
                        <span className={labelCls}>Note for the editor (optional)</span>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="What needs to change before this can go live?"
                            className={inputCls}
                        />
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={reject} disabled={pending} className={btn.danger}>{pending ? "Sending…" : "Reject change"}</button>
                        <button type="button" onClick={() => setRejecting(false)} disabled={pending} className={btn.ghost}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={approve} disabled={pending} className={btn.brand}>{pending ? "Publishing…" : "Approve & publish"}</button>
                    <button type="button" onClick={() => setRejecting(true)} disabled={pending} className={btn.danger}>Reject…</button>
                </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
