import { api, ApiError } from "@/lib/server/api";
import { isSameOrigin, jsonError, sessionOrResponse } from "@/lib/server/request";

/* Browser → this route → Laravel. Keeps the API token server-side. Accepts one or more `file` fields. */
export async function POST(req: Request) {
    if (!isSameOrigin(req)) return jsonError("Bad origin", 403);
    const session = await sessionOrResponse();
    if (session instanceof Response) return session;

    let incoming: FormData;
    try {
        incoming = await req.formData();
    } catch {
        return jsonError("Expected a multipart form upload.");
    }

    const form = new FormData();
    for (const file of incoming.getAll("file")) {
        if (file instanceof File && file.size > 0) form.append("files[]", file, file.name);
    }
    if (!form.has("files[]")) return jsonError("No file received.");

    try {
        const res = await api<{ data: unknown[] }>("/admin/media", { method: "POST", form, token: session.token });
        return Response.json({ items: res.data });
    } catch (err) {
        return jsonError(err instanceof ApiError ? err.message : "Upload failed.", err instanceof ApiError ? err.status : 500);
    }
}
