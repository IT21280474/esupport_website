import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "eSupport Admin", template: "%s · eSupport Admin" },
    robots: { index: false, follow: false },
};

/* Every admin page is per-user and must never be cached. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-root min-h-screen w-full bg-neutral-50 text-neutral-900 antialiased" style={{ fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
            {children}
        </div>
    );
}
