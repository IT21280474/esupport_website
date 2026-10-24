import Link from "next/link";
import { api } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import { getSchema } from "@/lib/server/content";
import { cardCls, formatDate } from "../../_components/ui";

export const metadata = { title: "Approvals" };

type Approval = { id: number; section_key: string; submitted_at: string; user_name: string | null };

const DONE: Record<string, string> = {
    approved: "Approved — the change is now live.",
    rejected: "Rejected — the editor will see your note when they open the section.",
};

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
    const { token } = await requireUser("admin");
    const { done } = await searchParams;
    const [{ data: approvals }, schema] = await Promise.all([api<{ data: Approval[] }>("/admin/approvals", { token }), getSchema(token)]);
    const titleOf = (key: string) => schema.sections.find(s => s.key === key)?.title ?? key;

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
            <p className="mb-6 mt-1 text-sm text-neutral-500">Content changes from editors. Nothing here is on the live site until you approve it.</p>

            {done && DONE[done] && <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{DONE[done]}</p>}

            <div className={`${cardCls} overflow-hidden`}>
                {approvals.length ? (
                    <ul className="divide-y divide-neutral-100">
                        {approvals.map(a => (
                            <li key={a.id}>
                                <Link href={`/admin/approvals/${a.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-neutral-50">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{titleOf(a.section_key)}</span>
                                    <span className="text-sm text-neutral-600">{a.user_name ?? "Deleted user"}</span>
                                    <span className="w-40 text-right text-xs text-neutral-500">{formatDate(a.submitted_at)}</span>
                                    <span className="text-xs font-medium text-neutral-900">Review →</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="px-5 py-12 text-center text-sm text-neutral-500">Nothing waiting for approval.</p>
                )}
            </div>
        </div>
    );
}
