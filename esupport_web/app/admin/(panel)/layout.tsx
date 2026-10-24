import { requireUser } from "@/lib/server/auth";
import { getSchema } from "@/lib/server/content";
import type { SectionGroup } from "@/lib/content/schema";
import Sidebar from "../_components/Sidebar";

const GROUPS: SectionGroup[] = ["Global", "Home page", "Services page", "Gallery page", "Careers page", "Footer"];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
    const { user, token, unreadLeads, pendingApprovals } = await requireUser();
    const schema = await getSchema(token);

    const contentGroups = GROUPS.map(group => ({
        title: group,
        items: schema.sections.filter(s => s.group === group).map(s => ({ href: `/admin/content/${s.key}`, label: s.title })),
    }));

    const groups = [
        {
            title: "Overview",
            items: [
                { href: "/admin", label: "Dashboard" },
                ...(user.role === "admin" ? [{ href: "/admin/approvals", label: "Approvals", badge: pendingApprovals }] : []),
                { href: "/admin/inbox", label: "Inbox", badge: unreadLeads },
                { href: "/admin/media", label: "Media library" },
            ],
        },
        ...contentGroups,
        {
            title: "Team",
            items: [
                ...(user.role === "admin" ? [{ href: "/admin/users", label: "Users & roles" }] : []),
                { href: "/admin/activity", label: "Activity log" },
                { href: "/admin/account", label: "My account" },
            ],
        },
    ];

    return (
        <div className="min-h-screen">
            <Sidebar groups={groups} user={user} />
            <div className="lg:pl-64">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
            </div>
        </div>
    );
}
