"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/server/api";

export type LeadState = { ok?: boolean; error?: string } | undefined;

/* Public "Get Started" form → Laravel (which validates, rate-limits per visitor IP and stores it). */
export async function submitLeadAction(_prev: LeadState, form: FormData): Promise<LeadState> {
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const service = String(form.get("service") ?? "").trim();
    let message = String(form.get("message") ?? "").trim();
    const company = String(form.get("company") ?? ""); // Honeypot

    if (!email) {
        return { error: "Please enter your email address." };
    }

    if (!phone) {
        return { error: "Please enter your Phone or WhatsApp number." };
    }

    if (service) {
        message = message ? `[Interested in: ${service}]\n\n${message}` : `[Interested in: ${service}]`;
    }

    const source = String(form.get("source") ?? "").trim() || "Website — Contact Us Form";

    try {
        await api("/leads", {
            method: "POST",
            forwardIp: true,
            body: {
                name: name || undefined,
                email,
                phone: phone || undefined,
                message: message || undefined,
                company,
                source,
            },
        });
    } catch (err) {
        if (err instanceof ApiError && err.status === 422) return { error: "Please check your details and enter a valid email." };
        if (err instanceof ApiError && err.status === 429) return { error: err.message };
        return { error: "Sorry, something went wrong. Please try again or contact us directly on WhatsApp." };
    }
    revalidatePath("/admin", "layout");
    return { ok: true };
}
