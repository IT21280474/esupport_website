import "server-only";

import { ApiError } from "./api";
import { authorize, type Session } from "./auth";

/** Rejects cross-site POSTs to admin route handlers (server actions already check this). */
export function isSameOrigin(req: Request): boolean {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!origin || !host) return false;
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

export const jsonError = (message: string, status = 400) => Response.json({ error: message }, { status });

/** For route handlers: the signed-in session, or the JSON error to return (signed out, or the API can't be reached). */
export async function sessionOrResponse(): Promise<Session | Response> {
    try {
        return (await authorize()) ?? jsonError("Not signed in", 401);
    } catch (err) {
        return err instanceof ApiError ? jsonError(err.message, err.status) : jsonError("Something went wrong. Please try again.", 500);
    }
}
