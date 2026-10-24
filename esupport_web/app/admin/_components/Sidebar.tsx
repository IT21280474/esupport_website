"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "../actions";

type NavItem = { href: string; label: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };

export default function Sidebar({
    groups,
    user,
}: {
    groups: NavGroup[];
    user: { name: string; email: string; role: string };
}) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    /* Match whole path segments: /admin/content/gallery must not light up on /admin/content/galleryPage. */
    const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

    const nav = (
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {groups.map(group => (
                <div key={group.title}>
                    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{group.title}</p>
                    <ul className="space-y-0.5">
                        {group.items.map(item => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                                        isActive(item.href) ? "bg-white text-neutral-900 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <span className="truncate">{item.label}</span>
                                    {!!item.badge && (
                                        <span className="ml-2 rounded-full bg-[var(--brand-1)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{item.badge}</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-neutral-950 px-4 py-3 text-white">
                <Image src="/wood-logo-dark-cop.png" alt="eSupport" width={120} height={36} className="h-7 w-auto object-contain" />
                <button onClick={() => setOpen(o => !o)} className="rounded-md px-3 py-1.5 text-sm bg-white/10" aria-expanded={open}>
                    {open ? "Close" : "Menu"}
                </button>
            </div>

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-neutral-950 text-white transition-transform lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="px-6 pt-6 pb-4 border-b border-white/10">
                    <Link href="/admin" className="block">
                        <Image src="/wood-logo-dark-cop.png" alt="eSupport" width={150} height={44} className="h-9 w-auto object-contain" />
                    </Link>
                    <div className="mt-4 h-[2px] w-16" style={{ background: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3), var(--brand-4), var(--brand-5))" }} />
                </div>
                {nav}
                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-1)] text-sm font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-[11px] uppercase tracking-wider text-white/40">{user.role}</p>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white/10 px-3 py-1.5 text-center text-xs hover:bg-white/20">
                            View site ↗&#xFE0E;
                        </a>
                        <form action={logoutAction}>
                            <button type="submit" className="w-full rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">Sign out</button>
                        </form>
                    </div>
                </div>
            </aside>
            {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
        </>
    );
}
