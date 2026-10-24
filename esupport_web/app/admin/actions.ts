"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/server/api";
import { authorize, clearSessionToken, setSessionToken, type SessionUser } from "@/lib/server/auth";
import { CONTENT_TAG } from "@/lib/server/content";
import type { SectionKey } from "@/lib/content/types";

/* Every action calls the Laravel API, which owns validation, permissions and the MySQL data. */

export type FormState = { error?: string; ok?: string } | undefined;

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const errorOf = (err: unknown) => (err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
const EXPIRED = { error: "Your session has expired. Sign in again." };

/* Public pages are cached; expire them after any content change so edits show immediately. */
const refreshSite = () => {
    updateTag(CONTENT_TAG);
    revalidatePath("/", "layout");
};

/* ── Auth ─────────────────────────────────────────────────────────────────── */
export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
    try {
        const res = await api<{ token: string; user: SessionUser }>("/auth/login", {
            method: "POST",
            body: { email: str(form, "email"), password: String(form.get("password") ?? "") },
            forwardIp: true,
        });
        await setSessionToken(res.token);
    } catch (err) {
        return { error: errorOf(err) };
    }
    redirect("/admin");
}

export async function logoutAction() {
    const session = await authorize();
    if (session) await api("/auth/logout", { method: "POST", token: session.token }).catch(() => {});
    await clearSessionToken();
    redirect("/admin/login");
}

/* ── Content ──────────────────────────────────────────────────────────────── */
/* Admins publish straight away; editors' saves come back with published: false and wait for approval. */
type SaveResult = { error?: string; data?: unknown; published?: boolean };

export async function saveSectionAction(key: SectionKey, data: unknown): Promise<SaveResult> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        const res = await api<{ data: unknown; published: boolean }>(`/admin/sections/${key}`, { method: "PUT", body: { data }, token: session.token });
        if (res.published) refreshSite();
        return { data: res.data, published: res.published };
    } catch (err) {
        return { error: errorOf(err) };
    }
}

export async function discardDraftAction(key: SectionKey): Promise<{ error?: string }> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        await api(`/admin/sections/${key}/draft`, { method: "DELETE", token: session.token });
        return {};
    } catch (err) {
        return { error: errorOf(err) };
    }
}

export async function resetSectionAction(key: SectionKey): Promise<{ error?: string }> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        await api(`/admin/sections/${key}`, { method: "DELETE", token: session.token });
        refreshSite();
        return {};
    } catch (err) {
        return { error: err instanceof ApiError && err.status === 403 ? "Only administrators can reset a section to defaults." : errorOf(err) };
    }
}

export async function restoreRevisionAction(key: SectionKey, revisionId: number): Promise<SaveResult> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        const res = await api<{ data: unknown; published: boolean }>(`/admin/sections/${key}/revisions/${revisionId}/restore`, { method: "POST", token: session.token });
        if (res.published) refreshSite();
        return { data: res.data, published: res.published };
    } catch (err) {
        return { error: errorOf(err) };
    }
}

/* ── Approvals (admin only — enforced by Laravel) ─────────────────────────── */
export async function approveRevisionAction(id: number): Promise<{ error?: string }> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        await api(`/admin/approvals/${id}/approve`, { method: "POST", token: session.token });
        refreshSite();
        revalidatePath("/admin", "layout");
        return {};
    } catch (err) {
        return { error: errorOf(err) };
    }
}

export async function rejectRevisionAction(id: number, note: string): Promise<{ error?: string }> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        await api(`/admin/approvals/${id}/reject`, { method: "POST", body: { note: note.trim() || null }, token: session.token });
        revalidatePath("/admin", "layout");
        return {};
    } catch (err) {
        return { error: errorOf(err) };
    }
}

/* ── Users (admin only — enforced by Laravel) ─────────────────────────────── */
export async function createUserAction(_prev: FormState, form: FormData): Promise<FormState> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        const res = await api<{ data: SessionUser }>("/admin/users", {
            method: "POST",
            token: session.token,
            body: { name: str(form, "name"), email: str(form, "email"), password: String(form.get("password") ?? ""), role: str(form, "role") },
        });
        revalidatePath("/admin/users");
        return { ok: `${res.data.name} can now sign in with ${res.data.email}.` };
    } catch (err) {
        return { error: errorOf(err) };
    }
}

export async function updateUserAction(_prev: FormState, form: FormData): Promise<FormState> {
    const session = await authorize();
    if (!session) return EXPIRED;
    const password = String(form.get("password") ?? "");
    try {
        await api(`/admin/users/${Number(form.get("id"))}`, {
            method: "PATCH",
            token: session.token,
            body: {
                name: str(form, "name"),
                role: str(form, "role"),
                is_active: form.get("active") === "on",
                ...(password ? { password } : {}),
            },
        });
        revalidatePath("/admin/users");
        return { ok: "Saved." };
    } catch (err) {
        return { error: errorOf(err) };
    }
}

export async function deleteUserAction(id: number): Promise<{ error?: string }> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        await api(`/admin/users/${id}`, { method: "DELETE", token: session.token });
        revalidatePath("/admin/users");
        return {};
    } catch (err) {
        return { error: errorOf(err) };
    }
}

/* ── Own account ──────────────────────────────────────────────────────────── */
export async function updateAccountAction(_prev: FormState, form: FormData): Promise<FormState> {
    const session = await authorize();
    if (!session) return EXPIRED;
    const password = String(form.get("password") ?? "");
    try {
        await api("/admin/account", {
            method: "PATCH",
            token: session.token,
            body: {
                name: str(form, "name"),
                ...(password
                    ? { current_password: String(form.get("current") ?? ""), password, password_confirmation: String(form.get("confirm") ?? "") }
                    : {}),
            },
        });
        revalidatePath("/admin", "layout");
        return { ok: password ? "Profile and password updated. Other devices were signed out." : "Profile updated." };
    } catch (err) {
        return { error: errorOf(err) };
    }
}

/* ── Leads inbox ──────────────────────────────────────────────────────────── */
export async function markLeadAction(id: number, read: boolean) {
    const session = await authorize();
    if (!session) return;
    await api(`/admin/leads/${id}`, { method: "PATCH", body: { read }, token: session.token });
    revalidatePath("/admin", "layout");
}

export async function deleteLeadAction(id: number) {
    const session = await authorize();
    if (!session) return;
    await api(`/admin/leads/${id}`, { method: "DELETE", token: session.token });
    revalidatePath("/admin", "layout");
}

/* ── Media ────────────────────────────────────────────────────────────────── */
export async function deleteMediaAction(id: number): Promise<{ error?: string }> {
    const session = await authorize();
    if (!session) return EXPIRED;
    try {
        await api(`/admin/media/${id}`, { method: "DELETE", token: session.token });
        revalidatePath("/admin/media");
        return {};
    } catch (err) {
        return { error: errorOf(err) };
    }
}
