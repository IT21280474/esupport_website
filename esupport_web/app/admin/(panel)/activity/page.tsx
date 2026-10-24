import { api } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import { describeActivity } from "../../_components/activity";
import { cardCls, formatDate } from "../../_components/ui";

export const metadata = { title: "Activity log" };

type Row = { id: number; action: string; detail: string | null; created_at: string; user_name: string | null };

export default async function ActivityPage() {
    const { token } = await requireUser();
    const { data: rows } = await api<{ data: Row[] }>("/admin/activity", { token });

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Activity log</h1>
            <p className="mb-6 mt-1 text-sm text-neutral-500">Who changed what, most recent first (last 300 events).</p>
            <div className={`${cardCls} overflow-hidden`}>
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">When</th>
                            <th className="px-4 py-3 font-medium">Who</th>
                            <th className="px-4 py-3 font-medium">What</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {rows.map(r => (
                            <tr key={r.id}>
                                <td className="whitespace-nowrap px-4 py-2.5 text-neutral-500">{formatDate(r.created_at)}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 font-medium">{r.user_name ?? "—"}</td>
                                <td className="px-4 py-2.5">{describeActivity(r.action, r.detail)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
