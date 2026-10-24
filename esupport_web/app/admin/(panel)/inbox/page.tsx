import { api } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import { cardCls, formatDate } from "../../_components/ui";
import LeadActions from "./LeadActions";

export const metadata = { title: "Inbox" };

type Lead = {
    id: number;
    email: string;
    name?: string | null;
    phone?: string | null;
    message?: string | null;
    source: string | null;
    created_at: string;
    is_read: boolean;
};

export default async function InboxPage() {
    const { token } = await requireUser();
    const { data: leads } = await api<{ data: Lead[] }>("/admin/leads", { token });

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
                    <p className="mt-1 text-sm text-neutral-500">Enquiries and submissions from the website’s contact form.</p>
                </div>
                {leads.length > 0 && (
                    <a href="/api/admin/leads" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                        Export CSV
                    </a>
                )}
            </div>
            <div className={`${cardCls} overflow-hidden`}>
                {leads.length ? (
                    <ul className="divide-y divide-neutral-100">
                        {leads.map(l => (
                            <li key={l.id} className={`p-5 transition-colors ${l.is_read ? "" : "bg-orange-50/40"}`}>
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${l.is_read ? "bg-transparent" : "bg-[var(--brand-1)]"}`} />
                                        <span className="font-semibold text-neutral-900 text-sm">
                                            {l.name ? l.name : "Website Visitor"}
                                        </span>
                                        <a href={`mailto:${l.email}`} className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline">
                                            {l.email}
                                        </a>
                                        {l.phone && (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                                                <a href={`tel:${l.phone}`} className="hover:underline">{l.phone}</a>
                                                <a
                                                    href={`https://wa.me/${l.phone.replace(/[^\d]/g, "")}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:underline font-medium"
                                                    title="Chat on WhatsApp"
                                                >
                                                    WhatsApp
                                                </a>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-neutral-400">{formatDate(l.created_at)}</span>
                                        <LeadActions id={l.id} read={l.is_read} email={l.email} />
                                    </div>
                                </div>
                                {l.message && (
                                    <div className="mt-2 text-xs text-neutral-700 bg-neutral-50/80 border border-neutral-100 rounded-lg p-3 whitespace-pre-line leading-relaxed">
                                        {l.message}
                                    </div>
                                )}
                                <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-400">
                                    <span>Source: {l.source || "Website"}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="px-5 py-12 text-center text-sm text-neutral-500">No enquiries yet.</p>
                )}
            </div>
        </div>
    );
}
