import Link from "next/link";
import { api } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import { getSchema } from "@/lib/server/content";
import { cardCls, formatDate } from "../_components/ui";
import { describeActivity } from "../_components/activity";

export const metadata = { title: "Dashboard" };

type Dashboard = {
    stats: { unread_leads: number; edited_sections: number; total_sections: number; media: number; active_users: number };
    edited: Record<string, { updated_at: string; updated_by: string | null }>;
    activity: { data: { action: string; detail: string | null; created_at: string; user_name: string | null }[] };
    leads: { data: { id: number; email: string; created_at: string; is_read: boolean }[] };
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
    const { user, token } = await requireUser();
    const { denied } = await searchParams;
    const [dash, schema] = await Promise.all([api<Dashboard>("/admin/dashboard", { token }), getSchema(token)]);

    const stats = [
        { label: "Unread enquiries", value: dash.stats.unread_leads, href: "/admin/inbox", accent: "var(--brand-1)" },
        { label: "Customised sections", value: `${dash.stats.edited_sections} / ${dash.stats.total_sections}`, href: "#sections", accent: "var(--brand-4)" },
        { label: "Media files", value: dash.stats.media, href: "/admin/media", accent: "var(--brand-3)" },
        { label: "Team members", value: dash.stats.active_users, href: user.role === "admin" ? "/admin/users" : "/admin/activity", accent: "var(--brand-2)" },
    ];
    const activity = Array.isArray(dash.activity) ? dash.activity : dash.activity.data;
    const leads = Array.isArray(dash.leads) ? dash.leads : dash.leads.data;

    return (
        <div className="space-y-8">
            {denied && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    That page is for administrators only. Ask an admin if you need access.
                </p>
            )}
            <div>
                <p className="text-sm text-neutral-500">Welcome back,</p>
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map(s => (
                    <Link key={s.label} href={s.href} className={`${cardCls} relative overflow-hidden p-5 transition-shadow hover:shadow-md`}>
                        <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: s.accent }} />
                        <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                        <p className="mt-1 text-sm text-neutral-500">{s.label}</p>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <section id="sections" className={`${cardCls} lg:col-span-3`}>
                    <h2 className="border-b border-neutral-200 px-5 py-4 text-sm font-semibold">Website sections</h2>
                    <ul className="grid divide-y divide-neutral-100 sm:grid-cols-2 sm:divide-y-0">
                        {schema.sections.map(s => (
                            <li key={s.key}>
                                <Link href={`/admin/content/${s.key}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-neutral-50">
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium">{s.title}</span>
                                        <span className="block truncate text-xs text-neutral-400">
                                            {dash.edited[s.key] ? `Edited ${formatDate(dash.edited[s.key].updated_at)}` : "Default content"}
                                        </span>
                                    </span>
                                    <span className={`h-2 w-2 shrink-0 rounded-full ${dash.edited[s.key] ? "bg-green-500" : "bg-neutral-300"}`} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="space-y-6 lg:col-span-2">
                    <section className={cardCls}>
                        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                            <h2 className="text-sm font-semibold">Latest enquiries</h2>
                            <Link href="/admin/inbox" className="text-xs text-neutral-500 hover:text-neutral-900">View all →</Link>
                        </div>
                        {leads.length ? (
                            <ul className="divide-y divide-neutral-100">
                                {leads.map(l => (
                                    <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                                        <span className={`truncate ${l.is_read ? "text-neutral-500" : "font-semibold"}`}>{l.email}</span>
                                        <span className="shrink-0 text-xs text-neutral-400">{formatDate(l.created_at)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-5 py-6 text-sm text-neutral-500">No enquiries yet. They arrive from the “Get Started” form on the home page.</p>
                        )}
                    </section>

                    <section className={cardCls}>
                        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                            <h2 className="text-sm font-semibold">Recent activity</h2>
                            <Link href="/admin/activity" className="text-xs text-neutral-500 hover:text-neutral-900">View all →</Link>
                        </div>
                        <ul className="divide-y divide-neutral-100">
                            {activity.map((a, i) => (
                                <li key={i} className="px-5 py-3 text-sm">
                                    <p><span className="font-medium">{a.user_name ?? "Someone"}</span> {describeActivity(a.action, a.detail)}</p>
                                    <p className="text-xs text-neutral-400">{formatDate(a.created_at)}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
