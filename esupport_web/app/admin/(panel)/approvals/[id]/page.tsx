import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import type { SectionDef } from "@/lib/content/schema";
import { cardCls, formatDate } from "../../../_components/ui";
import ChangeView from "./ChangeView";
import ReviewActions from "./ReviewActions";

type ApprovalDetail = {
    revision: {
        id: number;
        status: "pending" | "approved" | "rejected";
        submitted_at: string;
        user_name: string | null;
        reviewed_at: string | null;
        reviewer_name: string | null;
        review_note: string | null;
    };
    definition: SectionDef;
    live: Record<string, unknown>;
    proposed: Record<string, unknown>;
    stale: boolean;
};

export const metadata = { title: "Review change" };

export default async function ApprovalPage({ params }: { params: Promise<{ id: string }> }) {
    const { token } = await requireUser("admin");
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) notFound();

    let detail: ApprovalDetail;
    try {
        detail = await api<ApprovalDetail>(`/admin/approvals/${id}`, { token });
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }
    const { revision, definition: def } = detail;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/approvals" className="text-xs text-neutral-500 hover:text-neutral-900">← All approvals</Link>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-400">{def.group}</p>
                <h1 className="text-2xl font-bold tracking-tight">{def.title}</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Submitted by <span className="font-medium text-neutral-800">{revision.user_name ?? "a deleted user"}</span> · {formatDate(revision.submitted_at)}
                </p>
            </div>

            {detail.stale && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <span className="font-semibold">Heads up:</span> this section was changed on the live site after the editor started. “Live now” below is the current
                    version — approving replaces it with the proposed one.
                </p>
            )}

            <div className={`${cardCls} p-5`}>
                {revision.status === "pending" ? (
                    <ReviewActions id={revision.id} stale={detail.stale} />
                ) : (
                    <p className="text-sm text-neutral-600">
                        Already {revision.status} by {revision.reviewer_name ?? "an admin"} · {formatDate(revision.reviewed_at)}
                        {revision.review_note ? ` — “${revision.review_note}”` : ""}
                    </p>
                )}
            </div>

            <ChangeView fields={def.fields} live={detail.live} proposed={detail.proposed} />
        </div>
    );
}
