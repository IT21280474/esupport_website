import { api, ApiError } from "@/lib/server/api";
import { isSameOrigin, jsonError, sessionOrResponse } from "@/lib/server/request";

/* Asks Laravel to screenshot a live website into the media library. */
export async function POST(req: Request) {
    if (!isSameOrigin(req)) return jsonError("Bad origin", 403);
    const session = await sessionOrResponse();
    if (session instanceof Response) return session;

    const { url } = (await req.json().catch(() => ({}))) as { url?: string };
    if (!url) return jsonError("Missing URL.");

    try {
        const res = await api<{ data: unknown }>("/admin/media/capture", { method: "POST", body: { url }, token: session.token });
        return Response.json({ item: res.data });
    } catch (err) {
        return jsonError(err instanceof ApiError ? err.message : "Capture failed.", 422);
    }
}
