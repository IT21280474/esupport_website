import "server-only";

import { headers } from "next/headers";

/* Laravel backend (esupport_api). All data lives there; this app is the website + admin UI. */
export const API_URL = (
    process.env.LARAVEL_API_URL ||
    (process.env.NODE_ENV === "production" ? "https://madushan.alwaysdata.net" : "http://127.0.0.1:8000")
).replace(/\/$/, "");

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors?: Record<string, string[]>,
    ) {
        super(message);
    }
}

type ApiOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    form?: FormData;
    token?: string | null;
    /** Pass the visitor's IP so Laravel can rate-limit per person, not per website server. */
    forwardIp?: boolean;
    /** Cache settings for public reads; everything else is never cached. */
    next?: { revalidate?: number; tags?: string[] };
};

export async function clientIp(): Promise<string> {
    const h = await headers();
    return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim();
}

const FALLBACK_MESSAGES: Record<number, string> = {
    401: "Your session has expired. Sign in again.",
    403: "You don't have permission to do that.",
    404: "Not found.",
    429: "Too many attempts. Please wait and try again.",
};

function messageFrom(status: number, data: { message?: string; errors?: Record<string, string[]> }): string {
    const firstError = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    /* Laravel's own 429 messages are user-facing; its 401/403/404 ones ("Unauthenticated.") are not. */
    if (status === 429 && data.message && data.message !== "Too Many Attempts.") return firstError || data.message;
    return firstError || FALLBACK_MESSAGES[status] || data.message || "Something went wrong. Please try again.";
}

/** Calls the Laravel API (`/api/v1/...`) and returns the decoded JSON, throwing ApiError on failure. */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
    const requestHeaders: Record<string, string> = { Accept: "application/json" };
    let body: BodyInit | undefined;

    if (options.token) requestHeaders.Authorization = `Bearer ${options.token}`;
    if (options.form) {
        body = options.form;
    } else if (options.body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
        body = JSON.stringify(options.body);
    }
    if (options.forwardIp) {
        const ip = await clientIp();
        if (ip) requestHeaders["X-Forwarded-For"] = ip;
    }

    let res: Response;
    try {
        res = await fetch(`${API_URL}/api/v1${path}`, {
            method: options.method ?? "GET",
            headers: requestHeaders,
            body,
            ...(options.next ? { next: options.next } : { cache: "no-store" as const }),
        });
    } catch {
        const altUrl = API_URL.includes(":8001")
            ? "http://127.0.0.1:8000"
            : (API_URL.includes(":8000") ? "http://127.0.0.1:8001" : null);

        if (altUrl) {
            try {
                res = await fetch(`${altUrl}/api/v1${path}`, {
                    method: options.method ?? "GET",
                    headers: requestHeaders,
                    body,
                    ...(options.next ? { next: options.next } : { cache: "no-store" as const }),
                });
            } catch {
                throw new ApiError(503, "The content server (Laravel API) is unreachable. Please make sure `php artisan serve` is running.");
            }
        } else {
            throw new ApiError(503, "The content server (Laravel API) is unreachable. Please make sure `php artisan serve` is running.");
        }
    }

    if (res.status === 204) return undefined as T;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, messageFrom(res.status, data), data.errors);
    return data as T;
}

/** Raw passthrough for streaming responses (e.g. CSV export). */
export async function apiRaw(path: string, token: string): Promise<Response> {
    return fetch(`${API_URL}/api/v1${path}`, {
        headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
}
