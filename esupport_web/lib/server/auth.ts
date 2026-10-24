import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";

/* The Laravel Sanctum token lives in an httpOnly cookie; the browser never sees it in JS. */
export const SESSION_COOKIE = "es_admin_session";
const SESSION_DAYS = 7;

export type Role = "admin" | "editor";

export type SessionUser = {
    id: number;
    name: string;
    email: string;
    role: Role;
    is_active: boolean;
    last_login_at: string | null;
};

export type Session = { user: SessionUser; token: string; unreadLeads: number; pendingApprovals: number };

export async function setSessionToken(token: string) {
    (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DAYS * 86_400,
    });
}

export async function clearSessionToken() {
    (await cookies()).delete(SESSION_COOKIE);
}

export async function sessionToken(): Promise<string | null> {
    return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** The signed-in user according to Laravel (memoised per request). */
export const getSession = cache(async (): Promise<Session | null> => {
    const token = await sessionToken();
    if (!token) return null;
    try {
        const me = await api<{ user: SessionUser; unread_leads: number; pending_approvals?: number }>("/auth/me", { token });
        return { user: me.user, token, unreadLeads: me.unread_leads, pendingApprovals: me.pending_approvals ?? 0 };
    } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return null;
        throw err;
    }
});

/** For pages: redirects to login when signed out, to the dashboard when the role is too low. */
export async function requireUser(role?: Role): Promise<Session> {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    if (role === "admin" && session.user.role !== "admin") redirect("/admin?denied=1");
    return session;
}

/** For server actions / route handlers: the session, or null (caller returns an error). */
export async function authorize(): Promise<Session | null> {
    return getSession();
}
